/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useCallback, useState } from 'react';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import {
  BaseEditor,
  Descendant,
  Transforms,
  Editor,
  createEditor,
  Text,
} from 'slate';
import Prism from 'prismjs';

Prism.languages.markdown = Prism.languages.extend('markup', {});
Prism.languages.insertBefore('markdown', 'prolog', {
  // blockquote: {
  //   pattern: /^>(?:[\t ]*>)*/m, alias: "punctuation"
  // },
  code: [
    { pattern: /^(?: {4}|\t).+/m, alias: 'keyword' },
    { pattern: /``.+?``|`[^`\n]+`/, alias: 'keyword' },
  ],
  // title: [
  //   {
  //     pattern: /\w+.*(?:\r?\n|\r)(?:==+|--+)/,
  //     alias: "important",
  //     inside: { punctuation: /==+$|--+$/ }
  //   },
  //   {
  //     pattern: /(^\s*)#+.+/m,
  //     lookbehind: !0,
  //     alias: "important",
  //     inside: { punctuation: /^#+|#+$/ }
  //   }
  // ],
  // hr: {
  //   pattern: /(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m,
  //   lookbehind: !0,
  //   alias: "punctuation"
  // },
  // list: {
  //   pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,
  //   lookbehind: !0, alias: "punctuation"
  // },
  // "url-reference": {
  //   pattern: /!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,
  //   inside: {
  //     variable: {
  //       pattern: /^(!?\[)[^\]]+/,
  //       lookbehind: !0
  //     },
  //     string: /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,
  //     punctuation: /^[\[\]!:]|[<>]/
  //   },
  //   alias: "url"
  // },
  bold: {
    pattern: /(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
    lookbehind: !0,
    inside: { punctuation: /^\*\*|^__|\*\*$|__$/ },
  },
  italic: {
    pattern: /(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
    lookbehind: !0,
    inside: { punctuation: /^[*_]|[*_]$/ },
  },
  url: {
    pattern: /!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,
    inside: {
      variable: {
        pattern: /(!?\[)[^\]]+(?=\]$)/,
        lookbehind: !0
      },
      string: { pattern: /"(?:\\.|[^"\\])*"(?=\)$)/ }
    }
  }
});

(Prism.languages.markdown as any).bold.inside.url = Prism.util.clone(
  Prism.languages.markdown.url,
);
(Prism.languages.markdown as any).italic.inside.url = Prism.util.clone(
  Prism.languages.markdown.url,
);
(Prism.languages.markdown as any).bold.inside.italic = Prism.util.clone(
  (Prism.languages.markdown as any).italic,
);
(Prism.languages.markdown as any).italic.inside.bold = Prism.util.clone((Prism.languages.markdown as any).bold); // prettier-ignore

const markdownLang = Prism.languages.markdown;

type CustomElement = { type: 'paragraph'; children: CustomText[] };
type CustomText = { text: string };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const Leaf = ({ attributes, children, leaf }: any) => {
  return (
    <span
      {...attributes}
      className={`${leaf.bold && 'font-bold'} ${leaf.italic && 'italic'} ${leaf.underlined && 'underline'
        } ${leaf.title && 'text-2xl font-bold my-4'} ${leaf.list && 'pl-4 text-xl'
        } ${leaf.hr && 'block text-center border-b-2 border-gray-300'} ${leaf.blockquote && 'pl-4 text-gray-400 italic'
        } ${leaf.code && 'font-mono bg-gray-100 p-1'}`}
    >
      {children}
    </span>
  );
};

type MessageBoxProps = {
  channelName: string;
  connecting: boolean;
  onSend: (msg: string) => { sent: boolean } | undefined;
};

const MessageBox: FC<MessageBoxProps> = ({
  channelName,
  connecting,
  onSend,
}) => {
  const [editor] = useState(() => withReact(createEditor()));
  const decorate = useCallback(([node, path]: any[]) => {
    const ranges: any[] = [];

    if (!Text.isText(node)) {
      return ranges;
    }

    const getLength = (token: any) => {
      if (typeof token === 'string') {
        return token.length;
      } else if (typeof token.content === 'string') {
        return token.content.length;
      } else {
        return token.content.reduce((l: any, t: any) => l + getLength(t), 0);
      }
    };

    const tokens = Prism.tokenize(node.text, markdownLang);
    let start = 0;

    for (const token of tokens) {
      const length = getLength(token);
      const end = start + length;

      if (typeof token !== 'string') {
        ranges.push({
          [token.type]: true,
          anchor: { path, offset: start },
          focus: { path, offset: end },
        });
      }

      start = end;
    }

    return ranges;
  }, []);

  const initialValue: Descendant[] = [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];

  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);
  return (
    <div className='flex items-center gap-x-4'>
      <Slate editor={editor} value={initialValue}>
        <Editable
          decorate={decorate}
          renderLeaf={renderLeaf}
          id='editor'
          spellCheck={true}
          autoCorrect='off'
          className='form-input py-3 px-4 block border-gray-200 rounded-md text-sm focus:border-brand-600 focus:ring-brand-600 dark:bg-gray-700 dark:border-gray-600 dark:text-[#DADADA] w-full'
          placeholder={
            connecting
              ? 'WebSocket is Connecting. Please Hold...'
              : `Message ${channelName}`
          }
          onKeyDown={(e) => {
            if (e.shiftKey && e.key === 'Enter') {
              e.preventDefault();
              editor.insertText('\n');
              return;
            }
            if (e.key === 'Enter') {
              e.preventDefault();
              if (
                (e.target as HTMLDivElement).outerText.includes(
                  `Message ${channelName}`,
                )
              )
                return;
              const sendingMsg = onSend((e.target as HTMLDivElement).outerText);
              if (sendingMsg?.sent) {
                Transforms.delete(editor, {
                  at: {
                    anchor: Editor.start(editor, []),
                    focus: Editor.end(editor, []),
                  },
                });
              }
              return;
            }
          }}
          readOnly={connecting}
        />
      </Slate>
      <button
        type='submit'
        className='py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md bg-brand-100 border border-transparent font-semibold text-brand-600 hover:text-white hover:bg-brand-600 focus:outline-none focus:ring-2 ring-offset-white focus:ring-brand-600 focus:text-white focus:bg-brand-600 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800'
        disabled={connecting}
        onClick={() => {
          if ((editor.children[0] as any)?.children[0].text.length === 0)
            return;
          const sendingMsg = onSend(
            (editor.children[0] as any)?.children[0].text,
          );
          if (sendingMsg?.sent) {
            Transforms.delete(editor, {
              at: {
                anchor: Editor.start(editor, []),
                focus: Editor.end(editor, []),
              },
            });
          }
        }}
      >
        Send
      </button>
    </div>
  );
};

export default MessageBox;
