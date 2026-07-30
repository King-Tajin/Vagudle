import { Cell } from "../../../grid/Cell";
import GreenBrushIcon from "@/assets/icons/green-brush.svg?react";
import YellowBrushIcon from "@/assets/icons/yellow-brush.svg?react";
import GrayBrushIcon from "@/assets/icons/gray-brush.svg?react";
import RecycleIcon from "@/assets/icons/recycle.svg?react";
import { Badge } from "../Badge";

export const HowToTab = () => {
  return (
    <div className="space-y-3">
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        Type a word and press <span className="text-crown-gold">Enter</span> to
        submit a guess. You have 11 tries to find the hidden word.
      </p>

      <div className="border-t border-obsidian-700" />

      <p className="font-pixel text-xs text-crown-amber tracking-widest">
        PAINT THE RESULT
      </p>
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        Cells don't color automatically. Select a brush, then click or drag
        cells to mark what you can figure out with the limited clues you have.
      </p>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <GreenBrushIcon className="w-8 h-8 shrink-0" />
          <Cell isCompleted={true} value="A" status="correct" cellSize={32} />
          <span className="font-code text-xs text-gray-400">
            Right letter, right spot
          </span>
        </div>
        <div className="flex items-center gap-3">
          <YellowBrushIcon className="w-8 h-8 shrink-0" />
          <Cell isCompleted={true} value="B" status="present" cellSize={32} />
          <span className="font-code text-xs text-gray-400">
            Right letter, wrong spot
          </span>
        </div>
        <div className="flex items-center gap-3">
          <GrayBrushIcon className="w-8 h-8 shrink-0" />
          <Cell isCompleted={true} value="C" status="absent" cellSize={32} />
          <span className="font-code text-xs text-gray-400">
            Letter not in the word
          </span>
        </div>
      </div>

      <div className="border-t border-obsidian-700" />

      <p className="font-pixel text-xs text-crown-amber tracking-widest">
        ROW TOOLS
      </p>

      <div className="flex items-center gap-3">
        <RecycleIcon className="w-8 h-8 shrink-0 text-gray-400" />
        <span className="font-code text-xs text-gray-400">
          Clears that row's painted colors
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-1 shrink-0">
          <Badge color="green" n={2} />
          <Badge color="yellow" n={1} />
          <Badge color="gray" n={2} />
        </div>
        <span className="font-code text-xs text-gray-400">
          Count of correct, present, and absent letters per row
        </span>
      </div>

      <div className="border-t border-obsidian-700" />

      <p className="font-pixel text-xs text-crown-amber tracking-widest">
        KEYBOARD
      </p>
      <p className="font-code text-xs text-gray-400">
        Key colors update as you paint — confirmed, present, and eliminated
        letters are always visible at a glance.
      </p>
    </div>
  );
};
