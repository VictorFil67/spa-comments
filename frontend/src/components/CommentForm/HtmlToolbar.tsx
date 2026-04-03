import './CommentForm.css';

interface Props {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInsert: (text: string) => void;
}

export function HtmlToolbar({ textareaRef, onInsert }: Props) {
  const wrapSelection = (tagOpen: string, tagClose: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const replacement = `${tagOpen}${selected}${tagClose}`;

    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    const newValue = before + replacement + after;

    onInsert(newValue);

    setTimeout(() => {
      textarea.focus();
      const cursorPos = selected
        ? start + replacement.length
        : start + tagOpen.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (!url) return;
    const title = prompt('Enter title (optional):') || '';
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end) || 'link text';
    const titleAttr = title ? ` title="${title}"` : '';
    const tag = `<a href="${url}"${titleAttr}>${selected}</a>`;

    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    onInsert(before + tag + after);
  };

  return (
    <div className="html-toolbar">
      <button type="button" onClick={() => wrapSelection('<i>', '</i>')}>
        [i]
      </button>
      <button
        type="button"
        onClick={() => wrapSelection('<strong>', '</strong>')}
      >
        [strong]
      </button>
      <button type="button" onClick={() => wrapSelection('<code>', '</code>')}>
        [code]
      </button>
      <button type="button" onClick={insertLink}>
        [a]
      </button>
    </div>
  );
}
