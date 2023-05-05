import RMarkdown from 'react-markdown';
import MarkdownCSS from '../styles/markdown.module.css';
import remarkGfm from 'remark-gfm';
import { FC } from 'react';

export type MarkdownProps = {
  children: string;
}
export const Markdown: FC<MarkdownProps> = ({ children }) => {
  return (
    <RMarkdown className={MarkdownCSS.markdown} skipHtml remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
      components={{
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        a: ({ node, ...props }) => {
          return <a {...props} target="_blank" rel="noreferrer" />
        }
      }}
    >
      {children}
    </RMarkdown>
  )
}