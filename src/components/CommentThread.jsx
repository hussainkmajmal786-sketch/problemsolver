import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './CommentThread.css';

export default function CommentThread({ comments, onAddComment, problemId, userId }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  const rootComments = comments.filter((c) => !c.parentId);

  const getReplies = (commentId) =>
    comments.filter((c) => {
      const pid = c.parentId?._id || c.parentId;
      return pid === commentId;
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || !userId) return;
    onAddComment({
      problemId,
      content: text.trim(),
      parentId: replyTo,
    });
    setText('');
    setReplyTo(null);
  };

  const Comment = ({ comment, depth = 0 }) => {
    const author = comment.author || {};
    const cId = comment._id || comment.id;
    const replies = getReplies(cId);

    return (
      <motion.div
        className="comment"
        style={{ marginLeft: depth * 24 }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="comment-header">
          <div className="avatar avatar-sm">{author?.name?.charAt(0) || '?'}</div>
          <span className="font-semibold text-sm">{author?.name || 'Anonymous'}</span>
          <span className="text-xs text-muted">
            {new Date(comment.createdAt || comment.created_at).toLocaleDateString()}
          </span>
        </div>
        <p className="comment-body">{comment.content}</p>
        {userId && (
          <button
            className="comment-reply-btn"
            onClick={() => setReplyTo(replyTo === cId ? null : cId)}
          >
            {replyTo === cId ? 'Cancel' : 'Reply'}
          </button>
        )}
        {replyTo === cId && (
          <form className="comment-form reply-form" onSubmit={handleSubmit}>
            <input className="input" placeholder="Write a reply..." value={text} onChange={(e) => setText(e.target.value)} />
            <button type="submit" className="btn btn-primary btn-sm"><FiSend size={14} /></button>
          </form>
        )}
        {replies.map((reply) => (
          <Comment key={reply._id || reply.id} comment={reply} depth={depth + 1} />
        ))}
      </motion.div>
    );
  };

  return (
    <div className="comment-thread" id="comment-thread">
      <h3 className="heading-sm mb-lg">Discussion ({comments.length})</h3>

      {userId && !replyTo && (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="avatar avatar-sm">{user?.name?.charAt(0) || '?'}</div>
          <input className="input" placeholder="Share your thoughts..." value={text} onChange={(e) => setText(e.target.value)} id="comment-input" />
          <button type="submit" className="btn btn-primary btn-sm" id="comment-submit"><FiSend size={14} /></button>
        </form>
      )}

      <div className="comments-list">
        {rootComments.length === 0 ? (
          <p className="text-muted text-sm" style={{ padding: '16px 0' }}>No comments yet. Be the first to share your thoughts!</p>
        ) : (
          rootComments.map((comment) => (
            <Comment key={comment._id || comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}
