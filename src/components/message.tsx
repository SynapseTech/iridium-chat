import { TextMessage, User } from "@prisma/client";
import { FC } from "react";

type MessageProps = {
    message: TextMessage & {
        author: User;
    };
};

const Message: FC<MessageProps> = ({ message }) => {
    return (
        <div className="py-4 transform-[translateY(-5rem)]" id={`message_${message.id}`}>
            <h1 className='font-bold'>{message.author.name}</h1>
            <p>{message.content}</p>
            <p>{new Date(message.createdTimestamp).toLocaleString()}</p>
        </div>
    );
};

export default Message;