import date, { Options as DateOptions } from "lume/plugins/date.ts";
import prism, { Options as PrismOptions } from "lume/plugins/prism.ts";
import basePath from "lume/plugins/base_path.ts";
import slugifyUrls from "lume/plugins/slugify_urls.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import metas from "lume/plugins/metas.ts";
import pagefind, { Options as PagefindOptions } from "lume/plugins/pagefind.ts";
import sitemap from "lume/plugins/sitemap.ts";
import readingInfo from "lume/plugins/reading_info.ts";
import type { Page, Site } from "lume/core.ts";
import code_highlight from "lume/plugins/code_highlight.ts";

import toc from "https://deno.land/x/lume_markdown_plugins@v0.5.1/toc.ts";

import lang_javascript from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/javascript.min.js";
import lang_bash from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/bash.min.js";
import lang_xml from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/xml.min.js";
import lang_json from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/json.min.js";
import lang_yaml from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/yaml.min.js";
import lang_markdown from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/markdown.min.js";

export interface Options {
  prism?: Partial<PrismOptions>;
  date?: Partial<DateOptions>;
  //pagefind?: Partial<PagefindOptions>;
}


function renderTOC(toc) {
  if (!toc || toc.length === 0) {
      return '';
  }

  let tocHtml = '<ol class="toc">';

  for (const item of toc) {
      tocHtml += `<li><a href="#${item.slug}">${item.text}</a>`;

      if (item.children && item.children.length > 0) {
          tocHtml += '<ul>';
          for (const child of item.children) {
              tocHtml += `<li><a href="#${child.slug}">${child.text}</a></li>`;
          }
          tocHtml += '</ul>';
      }

      tocHtml += '</li>';
  }

  tocHtml += '</ol>';

  return tocHtml;
}

/** Configure the site */
export default function (options: Options = {}) {
  return (site: Site) => {
    site
      .use(basePath())
      .use(prism(options.prism))
      .use(toc())
      .use(readingInfo())
      .use(date(options.date))
      .use(metas())
      .use(
        code_highlight({
          languages: {
            javascript: lang_javascript,
            bash: lang_bash,
            html: lang_xml,
            xml: lang_xml,
            json: lang_json,
            yaml: lang_yaml,
            lang_markdown: lang_markdown,
          },
        }),
      )
      .use(resolveUrls())
      .use(slugifyUrls())
      .use(pagefind(options.pagefind))
      .use(sitemap({
        priority: "priority",
      }));

    // Basic CSS Design System
    site.remoteFile(
      "css/pico.min.css",
      "https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css",
    );
    site.remoteFile(
      "css/github-dark.min.css",
      "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.6.0/build/styles/github-dark.min.css",
    );

    site.process([".md"], (page: Page) => {
      // Replace <!-- toc --> with the actual toc from page.data.toc_string
      // Replace <!-- toc --> with the generated table of contents
      if ( page.data.toc && page.data.toc.length) {
        if (page.data.content.includes("toc")) {
          const tocHtml = renderTOC(page.data.toc);
          page.data.content = (page.data.content as string).replace(/toc/i, tocHtml);
          console.log(page.data.content);  
        }
      }
    });

    // Copy files
    site
      .copy("css")
      .copy("js");
  };
}
