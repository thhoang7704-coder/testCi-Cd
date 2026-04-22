import React, {
  useImperativeHandle,
  useRef,
  forwardRef,
  useState,
} from "react";

const AvatarUpload = forwardRef(({ onUpload }, ref) => {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    openFileDialog: () => {
      inputRef.current && inputRef.current.click();
    },
  }));

  async function handleFileChange(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (typeof onUpload !== "function") return;
    try {
      setLoading(true);
      await onUpload(f);
    } finally {
      setLoading(false);
      // reset input so the same file can be selected again if needed
      e.target.value = null;
    }
  }

  return (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      onChange={handleFileChange}
      style={{ display: "none" }}
      aria-hidden
    />
  );
});

export default AvatarUpload;
