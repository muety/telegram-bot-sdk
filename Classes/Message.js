"use strict";

class Message {
    constructor(chat_id, text, parse_mode, disable_web_page_preview, disable_notification, reply_to_message_id, reply_markup) {
        this.chat_id = chat_id;
        this.text = text;
        this.parse_mode = parse_mode;
        this.disable_web_page_preview = disable_web_page_preview;
        this.disable_notification = disable_notification;
        this.reply_to_message_id = reply_to_message_id;
        this.reply_markup = JSON.stringify(reply_markup);
    }
}

module.exports = Message;