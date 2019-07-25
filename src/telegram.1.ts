export namespace Telegram {
    export interface InlineKeyboardButton {
        text: string;
        url?: string;
        callback_data?: string;
    }
    export interface KeyboardButton {
        text: string;
        request_contact?: boolean;
        request_location?: boolean;
    }
    export interface ReplyKeyboardMarkup extends Array<Array<KeyboardButton | string>> {
    }
    export interface InlineKeyboardMarkup extends Array<Array<InlineKeyboardButton>> {
    }
    export interface Update {
        update_id: number; //The update‘s unique identifier
        message?: Message; //Optional. New incoming message of any kind — text, photo, sticker, etc.
        edited_message?: Message; //Optional. New version of a message that is known to the bot and was edited
        channel_post?: Message; //Optional. New incoming channel post of any kind — text, photo, sticker, etc.
        edited_channel_post?: Message; //Optional. New version of a channel post that is known to the bot and was edited
        callback_query?: CallbackQuery; //Optional.New incoming callback query
    }
    export interface User {
        id: number; //Unique identifier for this user or bot
        is_bot: Boolean; //True, if this user is a bot
        first_name: string; //User‘s or bot’s first name
        last_name: string; //Optional.User‘s or bot’s last name
        username: string; //Optional.User‘s or bot’s username
        language_code: string; //Optional.IETF language tag of the user's language
    }
    export interface Message {
        from: User; //Sender
        text: string;
    }
    export interface CallbackQuery {
        id: string; //Unique identifier for this query
        from: User; //Sender
        message?: Message; //Optional.Message with the callback button that originated the query.Note that message content and message date will not be available if the message is too old
        inline_message_id?: string; //Optional.Identifier of the message sent via the bot in inline mode, that originated the query.
        chat_instance: string; //Global identifier, uniquely corresponding to the chat to which the message with the callback button was sent.Useful for high scores in games.
        data?: string; //Optional.Data associated with the callback button.Be aware that a bad client can send arbitrary data in this field.
        game_short_name?: string; //Optional.Short name of a Game to be returned, serves as the unique identifier for the game
    }
}

// declare function answerCallbackQuery(callback_query_id: string, text?: string, show_alert?: boolean, url?: string, cache_time?: number): void;
// declare function sendMessage(chat_id: number, text: string, reply_markup?: reply_markup): void;
// declare function sendLocation(chat_id: number, coordinates: any): void;
// declare function subscribe(callback: SubscribeCallback): void;

// interface reply_markup {
//     inline_keyboard?: Telegram.InlineKeyboardMarkup
//     keyboard?: Telegram.ReplyKeyboardMarkup
// }

// interface SubscribeCallback {
//     (updates: Array<Telegram.Update>): void
// }
