import { createHighlighter } from "shiki/index.mjs"
import { QuartzTransformerPlugin } from "../types"
import rehypePrettyCode, { Options as CodeOptions, Theme as CodeTheme } from "rehype-pretty-code"
import { readFile, readFileSync } from "fs"

interface Theme extends Record<string, CodeTheme> {
  light: CodeTheme
  dark: CodeTheme
}

interface Options {
  theme?: Theme
  keepBackground?: boolean
}

const defaultOptions: Options = {
  theme: {
    light: "github-light",
    dark: "github-dark",
  },
  keepBackground: false,
}

export const SyntaxHighlighting: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts: CodeOptions = { ...defaultOptions, ...userOpts }

  opts.getHighlighter = async (opts) => {
    console.log("creating highlighter");

    const lighter = await createHighlighter({...opts, langs: []})

    lighter.loadLanguageSync([JSON.parse(readFileSync("syntaxes/dm.json", "utf-8"))])

    return lighter;
  }

  return {
    name: "SyntaxHighlighting",
    htmlPlugins() {
      return [[rehypePrettyCode, opts]]
    },
  }
}
