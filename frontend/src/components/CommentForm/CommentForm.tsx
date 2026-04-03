import { useState, useRef, useEffect } from 'react';
import { createComment, fetchCaptcha } from '../../api/client';
import { HtmlToolbar } from './HtmlToolbar';
import type { CaptchaResponse } from '../../types';
import './CommentForm.css';

interface Props {
  parentId?: number | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function CommentForm({ parentId, onSuccess, onCancel }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [homePage, setHomePage] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [captcha, setCaptcha] = useState<CaptchaResponse | null>(null);
  const [captchaValue, setCaptchaValue] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadCaptcha = async () => {
    try {
      const data = await fetchCaptcha();
      setCaptcha(data);
      setCaptchaValue('');
    } catch {
      console.error('Failed to load CAPTCHA');
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!username.trim()) {
      errs.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
      errs.username = 'Only alphanumeric characters allowed';
    }

    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Invalid email format';
    }

    if (homePage && !/^https?:\/\/.+/.test(homePage)) {
      errs.homePage = 'Must be a valid URL (http:// or https://)';
    }

    if (!text.trim()) {
      errs.text = 'Comment text is required';
    }

    if (!captchaValue.trim()) {
      errs.captcha = 'CAPTCHA is required';
    }

    if (file) {
      const isImage = /\.(jpg|jpeg|gif|png)$/i.test(file.name);
      const isText = /\.txt$/i.test(file.name);
      if (!isImage && !isText) {
        errs.file = 'Only JPG, GIF, PNG or TXT files allowed';
      }
      if (isText && file.size > 102400) {
        errs.file = 'Text file must be under 100KB';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !captcha) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', username.trim());
      formData.append('email', email.trim());
      if (homePage.trim()) formData.append('homePage', homePage.trim());
      formData.append('text', text);
      formData.append('captchaId', captcha.id);
      formData.append('captchaValue', captchaValue.trim());
      if (parentId) formData.append('parentId', String(parentId));
      if (file) formData.append('file', file);

      await createComment(formData);

      setUsername('');
      setEmail('');
      setHomePage('');
      setText('');
      setFile(null);
      setCaptchaValue('');
      setShowPreview(false);
      setErrors({});
      loadCaptcha();
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } };
      const msg = error.response?.data?.message;
      if (Array.isArray(msg)) {
        setErrors({ server: msg.join(', ') });
      } else if (typeof msg === 'string') {
        setErrors({ server: msg });
      } else {
        setErrors({ server: 'Failed to post comment' });
      }
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <h3>{parentId ? 'Reply to comment' : 'Add a comment'}</h3>

      {errors.server && <div className="form-error-banner">{errors.server}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="username">User Name *</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Alphanumeric only"
            maxLength={100}
          />
          {errors.username && <span className="field-error">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail *</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            maxLength={255}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="homePage">Home Page</label>
          <input
            id="homePage"
            type="url"
            value={homePage}
            onChange={(e) => setHomePage(e.target.value)}
            placeholder="https://example.com"
            maxLength={500}
          />
          {errors.homePage && <span className="field-error">{errors.homePage}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="text">Comment *</label>
        <HtmlToolbar textareaRef={textareaRef} onInsert={setText} />
        <textarea
          id="text"
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Write your comment... Allowed tags: <a>, <code>, <i>, <strong>"
        />
        {errors.text && <span className="field-error">{errors.text}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="file">Attach file (image or .txt)</label>
        <input
          id="file"
          type="file"
          accept=".jpg,.jpeg,.gif,.png,.txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {errors.file && <span className="field-error">{errors.file}</span>}
      </div>

      <div className="form-row captcha-row">
        <div className="captcha-image">
          {captcha && (
            <div dangerouslySetInnerHTML={{ __html: captcha.svg }} />
          )}
          <button type="button" className="btn-refresh" onClick={loadCaptcha}>
            ↻
          </button>
        </div>
        <div className="form-group">
          <label htmlFor="captchaValue">CAPTCHA *</label>
          <input
            id="captchaValue"
            type="text"
            value={captchaValue}
            onChange={(e) => setCaptchaValue(e.target.value)}
            placeholder="Enter text from image"
          />
          {errors.captcha && <span className="field-error">{errors.captcha}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn-preview"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? 'Hide Preview' : 'Preview'}
        </button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
        {onCancel && (
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      {showPreview && (
        <div className="comment-preview">
          <h4>Preview:</h4>
          <div className="preview-header">
            <strong>{username || 'Anonymous'}</strong>
            <span>{email}</span>
          </div>
          <div
            className="preview-text"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </div>
      )}
    </form>
  );
}
