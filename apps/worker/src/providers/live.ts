import type { ImageGenerationProvider, LlmProvider, ShopifyPublishingProvider } from "./interfaces";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function extractOpenAiText(payload: any): string {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload?.output) ? payload.output : [];
  const chunks = output.flatMap((item: any) =>
    Array.isArray(item?.content)
      ? item.content
          .map((content: any) => content?.text)
          .filter((text: unknown): text is string => typeof text === "string" && text.trim().length > 0)
      : [],
  );

  return chunks.join("\n\n").trim();
}

export const openAiLlmProvider: LlmProvider = {
  async complete({ systemPrompt, userPrompt, model }) {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${requireEnv("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: systemPrompt }],
          },
          {
            role: "user",
            content: [{ type: "input_text", text: userPrompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed: ${response.status} ${await response.text()}`);
    }

    const json = await response.json();
    const output = extractOpenAiText(json);
    if (!output) {
      throw new Error("OpenAI returned an empty output");
    }

    return { output };
  },
};

export const passthroughImageProvider: ImageGenerationProvider = {
  async generate({ prompt, fileName }) {
    return {
      storageKey: `generated/${fileName}`,
      altText: prompt.slice(0, 140),
    };
  },
};

export const shopifyPublishingProvider: ShopifyPublishingProvider = {
  async publish({ shopDomain, accessToken, title, bodyHtml, summaryHtml, tags }) {
    const apiVersion = "2025-10";
    const headers = {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    };

    const blogsResponse = await fetch(`https://${shopDomain}/admin/api/${apiVersion}/blogs.json`, {
      headers,
    });

    if (!blogsResponse.ok) {
      throw new Error(`Failed to list Shopify blogs: ${blogsResponse.status} ${await blogsResponse.text()}`);
    }

    const blogsPayload = (await blogsResponse.json()) as {
      blogs?: Array<{ id: number | string; handle?: string }>;
    };

    const blogs = blogsPayload.blogs ?? [];
    const targetBlog = blogs.find((blog) => blog.handle === "news") ?? blogs[0];
    if (!targetBlog) {
      throw new Error(`No Shopify blog found for ${shopDomain}`);
    }

    const articleResponse = await fetch(
      `https://${shopDomain}/admin/api/${apiVersion}/blogs/${targetBlog.id}/articles.json`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          article: {
            title,
            body_html: bodyHtml,
            summary_html: summaryHtml,
            tags: tags.join(", "),
            published: true,
          },
        }),
      },
    );

    if (!articleResponse.ok) {
      throw new Error(`Failed to publish Shopify article: ${articleResponse.status} ${await articleResponse.text()}`);
    }

    const payload = (await articleResponse.json()) as {
      article?: { id: number | string; handle?: string };
    };

    const article = payload.article;
    if (!article?.id) {
      throw new Error("Shopify article publish response did not include an article id");
    }

    const handle = article.handle ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    return {
      articleId: String(article.id),
      liveUrl: `https://${shopDomain}/blogs/${targetBlog.handle ?? "news"}/${handle}`,
    };
  },
};
