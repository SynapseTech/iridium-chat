import { TextMessage, User } from "@prisma/client";
import classNames from "classnames";
import { FC } from "react";
import parse from 'html-react-parser';

type MessageProps = {
    message: TextMessage & {
        author: User;
    };
    pending?: boolean;
};

/**
* 
* @param {string} text Markdown text to be passed
* @returns Parsed Markdown into HTML
* 
*/
const markdownParser = (text: string) => {
    const toHTML = text
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>') // bold text
        .replace(/\*(.*)\*/gim, '<em>$1</em>') // italic text
        .replace(/\`(.*)\`/gim, '<code className="font-mono bg-gray-100 p-1 inline">$1</code>') // Inline Code
        .replace(/(?:\r\n|\r|\n)/g, '<br/>'); //New Lines
    return toHTML.trim(); // using trim method to remove whitespace
}


const Message: FC<MessageProps> = ({ message, pending = false }) => {
    return (
        <div className={classNames('py-2 px-6', { 'opacity-50': pending })} id={`message_${message.id}`}>
            <div className='flex gap-x-3'>
                <img className='inline-block h-12 w-12 rounded-full ring-2 ring-white dark:ring-gray-800' src={message.author.image ?? '/placeholder_avatar.svg'} alt={`${message.author.name}'s Avatar`} />
                <div className='flex flex-col'>
                    <div className='flex items-end gap-x-3'>
                        <span className='font-bold'>{message.author.name}</span>
                        <span className='text-slate-700 dark:text-slate-400 text-sm'>{new Date(message.createdTimestamp).toLocaleString()}</span>
                    </div>
                    <p className='break-all'>{parse(markdownParser(message.content))}</p>
                </div>
            </div>
        </div>
    );
};

export default Message;