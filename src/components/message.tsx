import { TextMessage, User } from "@prisma/client";
import { FC } from "react";

type MessageProps = {
    message: TextMessage & {
        author: User;
    };
};

const Message: FC<MessageProps> = ({ message }) => {
    return (
        <div className="py-2 px-6" id={`message_${message.id}`}>
            <div className='flex gap-x-3'>
                <img className='inline-block h-12 w-12 rounded-full ring-2 ring-white dark:ring-gray-800' src={message.author.image ?? '/placeholder_avatar.svg'} alt={`${message.author.name}'s Avatar`} />
                <div className='flex flex-col'>
                    <div className='flex items-end gap-x-3'>
                        <span className='font-bold'>{message.author.name}</span>
                        <span className='text-slate-700 dark:text-slate-400 text-sm'>{new Date(message.createdTimestamp).toLocaleString()}</span>
                    </div>
                    <p>{message.content}</p>
                </div>
            </div>
        </div>
    );
};

export default Message;