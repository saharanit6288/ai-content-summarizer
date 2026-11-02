import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import ipaddr from "ipaddr.js";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const MAX_HTML_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 15000;
const MAX_ARTICLE_CHARACTERS = 100000;


export class WebsiteExtractionError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "WebsiteExtractionError";
    this.statusCode = statusCode;
  }
}

function isPublicAddress(address) {
  try {
    let parsed = ipaddr.parse(address);

    if (parsed.kind() === "ipv6" && parsed.isIPv4MappedAddress()) {
      parsed = parsed.toIPv4Address();
    }

    return parsed.range() === "unicast";
  } catch {
    return false;
  }
}

async function validateDestination(url, lookupImpl = lookup) {
  const parsed = new URL(url);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new WebsiteExtractionError(
      "Only HTTP and HTTPS URLs are supported"
    );
  }

  if (parsed.username || parsed.password) {
    throw new WebsiteExtractionError(
      "URLs containing credentials are not allowed"
    );
  }

  const hostname = parsed.hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, "");

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  ) {
    throw new WebsiteExtractionError(
      "Local network addresses are not allowed"
    );
  }

  if (parsed.port) {
    const allowedPort =
      parsed.protocol === "https:" ? "443" : "80";

    if (parsed.port !== allowedPort) {
      throw new WebsiteExtractionError(
        "Custom ports are not allowed"
      );
    }
  }

  if (isIP(hostname)) {
    throw new WebsiteExtractionError(
      "IP address URLs are not allowed"
    );
  }

  let addresses;

  try {
    addresses = await lookupImpl(hostname, {
      all: true,
      verbatim: true
    });
  } catch {
    throw new WebsiteExtractionError(
      "Unable to resolve website hostname"
    );
  }

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => !isPublicAddress(address))
  ) {
    throw new WebsiteExtractionError(
      "Website destination is not publicly accessible"
    );
  }

  return parsed;
}

async function readLimitedBody(response) {
  const declaredLength = Number(
    response.headers.get("content-length") || 0
  );

  if (declaredLength > MAX_HTML_BYTES) {
    throw new WebsiteExtractionError(
      "Website HTML exceeds the 5 MB limit",
      413
    );
  }

  if (!response.body) {
    throw new WebsiteExtractionError(
      "Website returned an empty response"
    );
  }

  const reader = response.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      totalBytes += value.byteLength;

      if (totalBytes > MAX_HTML_BYTES) {
        await reader.cancel();

        throw new WebsiteExtractionError(
          "Website HTML exceeds the 5 MB limit",
          413
        );
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const buffer = Buffer.concat(chunks);

  return buffer.toString("utf8");
}

async function fetchWebsiteHtml(
  inputUrl,
  {
    fetchImpl = fetch,
    lookupImpl = lookup
  } = {}
) {
  let currentUrl = inputUrl;

  for (let redirectCount = 0; ; redirectCount++) {
    const parsedUrl = await validateDestination(
      currentUrl,
      lookupImpl
    );

    const controller = new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      FETCH_TIMEOUT_MS
    );

    try {
      const response = await fetchImpl(parsedUrl, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: "text/html"
        }
      });

      if (
        [301, 302, 303, 307, 308].includes(response.status)
      ) {
        const location = response.headers.get("location");

        await response.body?.cancel();

        if (!location || redirectCount >= MAX_REDIRECTS) {
          throw new WebsiteExtractionError(
            "Website has too many or invalid redirects"
          );
        }

        currentUrl = new URL(location, parsedUrl).href;
        continue;
      }

      if (!response.ok) {
        throw new WebsiteExtractionError(
          `Website returned HTTP ${response.status}`,
          502
        );
      }

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.toLowerCase().includes("text/html")) {
        throw new WebsiteExtractionError(
          "The URL does not point to an HTML webpage",
          415
        );
      }

      const html = await readLimitedBody(response);

      return {
        html,
        finalUrl: parsedUrl.href
      };
    } catch (error) {
      if (error instanceof WebsiteExtractionError) {
        throw error;
      }

      if (error.name === "AbortError") {
        throw new WebsiteExtractionError(
          "Website request timed out",
          504
        );
      }

      throw new WebsiteExtractionError(
        "Unable to download website",
        502
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

export async function extractWebsiteContent(
  inputUrl,
  options = {}
) {
  const { html, finalUrl } = await fetchWebsiteHtml(
    inputUrl,
    options
  );

  let dom;

  try {
    dom = new JSDOM(html, {
      url: finalUrl
      // Do not enable runScripts or resources.
    });

    const reader = new Readability(
      dom.window.document,
      {
        maxElemsToParse: 30000
      }
    );

    const article = reader.parse();

    if (!article || !article.textContent) {
      throw new WebsiteExtractionError(
        "Unable to extract readable article content"
      );
    }

    const extractedText = article.textContent
      .replace(/\s+/g, " ")
      .trim();

    if (extractedText.length < 100) {
      throw new WebsiteExtractionError(
        "The webpage does not contain enough readable content"
      );
    }

    if (extractedText.length > MAX_ARTICLE_CHARACTERS) {
      throw new WebsiteExtractionError(
        "Extracted article exceeds the 100,000 character limit",
        413
      );
    }

    return {
      title: article.title || null,
      text: extractedText,
      sourceUrl: finalUrl,
      siteName: article.siteName || null,
      byline: article.byline || null
    };
  } finally {
    dom?.window.close();
  }
}