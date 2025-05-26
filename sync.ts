/// <reference types="@types/bun" />

import { Glob } from 'bun';

import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeUnwrapImages from 'rehype-unwrap-images';

import { unified } from 'unified';

import { parse as yaml } from 'yaml';
import prettier from 'prettier';

import fs from 'node:fs/promises';

function processMarkdown(src: string, name: string) {
  const [header, result] = src.startsWith('---')
    ? src
        .split(/---/)
        .filter((e) => !!e)
        .map((e) => e.trim())
    : ['', src.trim()];

  const content = result || header;

  const metadata = result ? yaml(header) : {};

  return {
    metadata,
    html: unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkRehype)
      .use(rehypeUnwrapImages)
      .use(rehypeStringify)
      .processSync(content)
      .toString()
      // Replace lost uuids
      .replace(
        /\<p\>(:::video id=)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(:::)?\<\/p\>/g,
        ''
      )
      // Remove +++
      .replace(/\<p\>\+*\<\/p\>/g, '')
      .replaceAll('{', '&#123;')
      .replaceAll('}', '&#125;')
      .replaceAll('@', '&#64;')
			// Vite complains about alt="image" in images
      .replaceAll(' alt="image"', '')
      .replaceAll('assets/', `/courses/${name}/assets/`)
  };
}

const languages = [
  'cs', // Czech
  'de', // German
  'en', // English
  'es', // Spanish
  'et', // Estonian
  'fi', // Finnish
  'fr', // French
  'it', // Italian
  'pl', // Polish
  'pt', // Portuguese
  'ru' // Russian
];

const courses = new Glob('./bitcoin-educational-content/courses/**/*.md');

// Create a regular expression to match the desired languages in the file names (e.g., "en.md", "fr.md")
const markdownLanguagesPattern = new RegExp(`(${languages.join('|')})\\.md$`);

interface ToCEntry {
	title: string;
	goal: string;
	url: string;
	lang: string;
}

const toc: ToCEntry[] = [];

for await (const course of courses.scan()) {
  if (!markdownLanguagesPattern.test(course)) {
    continue; // Skip files that do not match wanted languages
  }

  const content = await Bun.file(course).text();
  const lang = course.match(markdownLanguagesPattern)?.[1];
  const name = course.split('/').slice(-2, -1)[0];

	if (!name) {
		console.error(`Skipping course: ${course} - Invalid name`);
		continue; // Skip if name is not found
	}

	if (!lang) {
		console.error(`Skipping course: ${course} - Invalid language`);
		continue; // Skip if language is not found
	}

	const { metadata, html } = processMarkdown(content, name);

  console.log(`Rendering courses/${lang}/${name}: ${metadata.name} (${content.length} characters)`);

	toc.push({
		title: metadata.name || name,
		goal: metadata.goal || '',
		url: `/${lang}/courses/${name}`,
		lang
	});

  await Bun.file(`./src/routes/${lang}/courses/${name}/+page.svelte`).write(
    await prettier.format(
      `<article class="markdown-body">\n${html}\n</article>\n`,
      {
        parser: 'svelte',
        plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss']
      }
    )
  );

  // Copy assets dir
  await fs.mkdir(`./static/courses/${name}/assets`, { recursive: true });
  await fs.cp(
    `./bitcoin-educational-content/courses/${name}/assets`,
    `./static/courses/${name}/assets`,
    { recursive: true, force: true }
  );
}

await Bun.file('./src/lib/courses.json').write(
  JSON.stringify(toc, null, 2)
);
