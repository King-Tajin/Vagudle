import { Cell } from "../../../grid/Cell";
import GreenBrushIcon from "@/assets/icons/green-brush.svg?react";
import YellowBrushIcon from "@/assets/icons/yellow-brush.svg?react";
import GrayBrushIcon from "@/assets/icons/gray-brush.svg?react";
import RecycleIcon from "@/assets/icons/recycle.svg?react";
import { Badge } from "../Badge";
import {
  ENTER_TEXT,
  HOWTO_INTRO_TEXT_PART1,
  HOWTO_INTRO_TEXT_PART2,
  HOWTO_PAINT_HEADING,
  HOWTO_PAINT_DESCRIPTION,
  HOWTO_GREEN_DESCRIPTION,
  HOWTO_YELLOW_DESCRIPTION,
  HOWTO_GRAY_DESCRIPTION,
  HOWTO_ROW_TOOLS_HEADING,
  HOWTO_CLEAR_ROW_DESCRIPTION,
  HOWTO_BADGE_COUNT_DESCRIPTION,
  HOWTO_KEYBOARD_HEADING,
  HOWTO_KEYBOARD_DESCRIPTION,
} from "../../../../constants/strings";

export const HowToTab = () => {
  return (
    <div className="space-y-3">
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        {HOWTO_INTRO_TEXT_PART1}{" "}
        <span className="text-crown-gold">{ENTER_TEXT}</span>{" "}
        {HOWTO_INTRO_TEXT_PART2}
      </p>

      <div className="border-t border-obsidian-700" />

      <p className="font-pixel text-xs text-crown-amber tracking-widest">
        {HOWTO_PAINT_HEADING}
      </p>
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        {HOWTO_PAINT_DESCRIPTION}
      </p>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <GreenBrushIcon className="w-8 h-8 shrink-0" />
          <Cell isCompleted={true} value="A" status="correct" cellSize={32} />
          <span className="font-code text-xs text-gray-400">
            {HOWTO_GREEN_DESCRIPTION}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <YellowBrushIcon className="w-8 h-8 shrink-0" />
          <Cell isCompleted={true} value="B" status="present" cellSize={32} />
          <span className="font-code text-xs text-gray-400">
            {HOWTO_YELLOW_DESCRIPTION}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <GrayBrushIcon className="w-8 h-8 shrink-0" />
          <Cell isCompleted={true} value="C" status="absent" cellSize={32} />
          <span className="font-code text-xs text-gray-400">
            {HOWTO_GRAY_DESCRIPTION}
          </span>
        </div>
      </div>

      <div className="border-t border-obsidian-700" />

      <p className="font-pixel text-xs text-crown-amber tracking-widest">
        {HOWTO_ROW_TOOLS_HEADING}
      </p>

      <div className="flex items-center gap-3">
        <RecycleIcon className="w-8 h-8 shrink-0 text-gray-400" />
        <span className="font-code text-xs text-gray-400">
          {HOWTO_CLEAR_ROW_DESCRIPTION}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-1 shrink-0">
          <Badge color="green" n={2} />
          <Badge color="yellow" n={1} />
          <Badge color="gray" n={2} />
        </div>
        <span className="font-code text-xs text-gray-400">
          {HOWTO_BADGE_COUNT_DESCRIPTION}
        </span>
      </div>

      <div className="border-t border-obsidian-700" />

      <p className="font-pixel text-xs text-crown-amber tracking-widest">
        {HOWTO_KEYBOARD_HEADING}
      </p>
      <p className="font-code text-xs text-gray-400">
        {HOWTO_KEYBOARD_DESCRIPTION}
      </p>
    </div>
  );
};
