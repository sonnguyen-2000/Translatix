import { memo } from 'react';
import { Bubble } from '@/components/modals/ComicModal';

interface Props {
  activeBubble: Bubble | null;
}

const BubbleEditorPanel = ({ activeBubble }: Props) => {
  return (
    <div className="space-y-3 text-secondary">
      {!activeBubble ? (
        <p className="text-xs text-center p-4">Chọn một khung thoại để bắt đầu dịch.</p>
      ) : (
        <>
          <div>
            <label className="text-xs font-semibold text-secondary">Văn bản gốc</label>
            <textarea
              readOnly
              className="w-full bg-surface-2 p-2 mt-1 rounded-md border border-default text-xs"
              rows={3}
              value={activeBubble.text}
            ></textarea>
          </div>
          <div>
            <label className="text-xs font-semibold text-secondary">Bản dịch</label>
            <textarea
              className="w-full bg-surface-2 p-2 mt-1 rounded-md border border-default text-xs"
              rows={3}
              defaultValue={activeBubble.translation}
            ></textarea>
          </div>
        </>
      )}
    </div>
  );
};

export default memo(BubbleEditorPanel);
