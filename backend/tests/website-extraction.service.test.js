import { describe, it, expect, vi } from "vitest";

import {
  extractWebsiteContent,
  WebsiteExtractionError
} from "../src/services/website-extraction.service.js";

const publicLookup = vi.fn().mockResolvedValue([
  {
    address: "93.184.216.34",
    family: 4
  }
]);

const articleHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Article</title>
</head>
<body>
  <nav>Home About Contact</nav>
  <article>
    <h1>Understanding Artificial Intelligence</h1>
    <p>
      Artificial intelligence is transforming many industries.
      Businesses use AI to automate tasks, improve productivity,
      analyze information, and support decision making.
      Responsible implementation requires good quality data,
      security, testing, and human oversight.
    </p>
    <p>
      Organizations should understand the limitations of AI
      systems before deploying them in critical environments.
      They should also monitor performance and evaluate results
      continuously.
    </p>
  </article>
</body>
</html>
`;

function htmlResponse(html = articleHtml) {
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8"
    }
  });
}

describe("extractWebsiteContent", () => {
  it("extracts readable article content", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(htmlResponse());

    const result = await extractWebsiteContent(
      "https://example.com/article",
      {
        fetchImpl,
        lookupImpl: publicLookup
      }
    );

    expect(result.text).toContain(
      "Artificial intelligence is transforming"
    );

    expect(result.title).toBeTruthy();
    expect(result.sourceUrl).toBe(
      "https://example.com/article"
    );

    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("rejects localhost URLs", async () => {
    await expect(
      extractWebsiteContent("http://localhost:5000")
    ).rejects.toThrow("Local network addresses are not allowed");
  });

  it("rejects IP address URLs", async () => {
    await expect(
      extractWebsiteContent("http://127.0.0.1")
    ).rejects.toThrow("IP address URLs are not allowed");
  });

  it("rejects a private DNS destination", async () => {
    const privateLookup = vi.fn().mockResolvedValue([
      {
        address: "192.168.1.10",
        family: 4
      }
    ]);

    await expect(
      extractWebsiteContent(
        "https://example.com/article",
        {
          lookupImpl: privateLookup
        }
      )
    ).rejects.toThrow(
      "Website destination is not publicly accessible"
    );
  });

  it("rejects a non-HTML response", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response("PDF content", {
        status: 200,
        headers: {
          "content-type": "application/pdf"
        }
      })
    );

    await expect(
      extractWebsiteContent(
        "https://example.com/document.pdf",
        {
          fetchImpl,
          lookupImpl: publicLookup
        }
      )
    ).rejects.toThrow(
      "The URL does not point to an HTML webpage"
    );
  });

  it("rejects a redirect to localhost", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 302,
        headers: {
          location: "http://localhost:5000"
        }
      })
    );

    await expect(
      extractWebsiteContent(
        "https://example.com/article",
        {
          fetchImpl,
          lookupImpl: publicLookup
        }
      )
    ).rejects.toThrow(
      "Local network addresses are not allowed"
    );

    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("rejects URLs containing credentials", async () => {
    await expect(
      extractWebsiteContent(
        "https://user:password@example.com/article",
        {
          lookupImpl: publicLookup
        }
      )
    ).rejects.toThrow(
      "URLs containing credentials are not allowed"
    );
  });
});