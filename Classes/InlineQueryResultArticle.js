"use strict";

class InlineQueryResultArticle {
    constructor(id, title, input_message_content) {
        this.type = 'article';
        this.id = id;
        this.title = title;
        this.input_message_content = input_message_content;
    }
}

module.exports = InlineQueryResultArticle;