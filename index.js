"use strict";

const unirest = require('unirest')
    , _ = require('lodash')
    , InlineQuery = require('./Classes/InlineQuery')
    , Message = require('./Classes/Message');

const API_BASE_URL = 'https://api.telegram.org/bot{token}/',
    API_GET_UPDATES = 'getUpdates?offset={offset}&timeout=60',
    API_POST_MESSAGE = 'sendMessage',
    API_ANSWER_INLINE_QUERY = 'answerInlineQuery';

var _token = ''
    , offset = 0
    , _commandCallbacks = null
    , _nonCommandCallback = null
    , _inlineQueryCallback = null;

function _getUpdates() {
    unirest.get(_resolveApiUrl(API_GET_UPDATES, {token: _token, offset: offset})).end((response) => {
        if (response.status != 200) return _getUpdates();

        var result = JSON.parse(response.raw_body).result;
        if (result.length > 0) {
            for (var i in result) {
                if (result[i].message) _processMessage(_.assign(new Message, result[i].message, {chat_id: result[i].message.chat.id}));
                else if (result[i].inline_query && result[i].inline_query.query.length) _inlineQueryCallback(_.assign(new InlineQuery, result[i].inline_query));
            }

            offset = parseInt(result[result.length - 1]['update_id']) + 1; // update max offset
        }
        _getUpdates();
    });
}

function _sendMessage(messageObject, callback) {
    unirest.post(_resolveApiUrl(API_POST_MESSAGE, {token: _token})).send(messageObject).end(callback);
}

function _answerInlineQuery(id, results, callback) {
    unirest.post(_resolveApiUrl(API_ANSWER_INLINE_QUERY, {token: _token})).send({inline_query_id: id, results: JSON.stringify(results)}).end(callback);
}

function _processMessage(message) {
    var splitted = _.split(message.text, ' ');
    if (splitted[0].indexOf("/") != 0) {
        // Non-command
        _nonCommandCallback(message);
    }
    else {
        // Command
        var command = splitted[0].substring(1, splitted[0].length);
        if (_commandCallbacks[command] == null) return false; // not a valid command?
        _commandCallbacks[command](message, _.slice(splitted, 1));
    }
    return true;
}

function _resolveApiUrl(urlRouteTemplate, values) {
    var url = API_BASE_URL + urlRouteTemplate;
    _(values).forEach((val, key) => {
        url = url.replace(`{${key}}`, val);
    });
    return url;
}

function _getOffset() {
    return offset;
}

module.exports = function (token, commandCallbacks, nonCommandCallback, inlineQueryCallback, initialOffset) {
    _token = token;
    _commandCallbacks = commandCallbacks;
    _nonCommandCallback = nonCommandCallback;
    _inlineQueryCallback = inlineQueryCallback;
    offset = initialOffset || 0;

    return {
        getUpdates: _getUpdates,
        sendMessage: _sendMessage,
        answerInlineQuery: _answerInlineQuery,
        getOffset: _getOffset,
        classes: {
            InlineKeyboardButton: require('./Classes/InlineKeyboardButton'),
            InlineKeyboard: require('./Classes/InlineKeyboard'),
            ReplyKeyboardMarkup: require('./Classes/ReplyKeyboardMarkup'),
            ReplyKeyboardHide: require('./Classes/ReplyKeyboardHide'),
            KeyboardButton: require('./Classes/KeyboardButton'),
            InputTextMessageContent: require('./Classes/InputTextMessageContent'),
            InlineQueryResultArticle: require('./Classes/InlineQueryResultArticle'),
            Message: Message,
            InlineQuery: InlineQuery
        },
        setCommandCallbacks: function (commandCallbacks) {
            _commandCallbacks = commandCallbacks;
        },
        setNonCommandCallback: function (nonCommandCallback) {
            _nonCommandCallback = nonCommandCallback;
        },
        setInlineQueryCallback: function (inlineQueryCallback) {
            _inlineQueryCallback = inlineQueryCallback;
        }
    }
};