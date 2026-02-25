const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Account'
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    video: {
        type: String
    },
    link: {
        type: String
    },
    linkPreview: {
        url: String,
        title: String,
        description: String,
        image: String,
        siteName: String
    },
    tags: [{
        type: String
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    }],
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account'
        },
        text: String,
        image: String,
        video: String,
        link: String,
        replies: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Account'
            },
            text: String,
            image: String,
            video: String,
            link: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
