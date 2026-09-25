import { Boxes, Camera, Cpu, Gamepad2, Headphones, Keyboard, Laptop, Monitor, Router, Smartphone, Tablet, Watch, HardDrive, Printer } from 'lucide-react';

const RULES = [
  [/laptop|notebook|computer|pc\b/i, Laptop],
  [/phone|mobile/i, Smartphone],
  [/tablet|ipad/i, Tablet],
  [/audio|headphone|earbud|speaker|sound/i, Headphones],
  [/watch|wearable/i, Watch],
  [/monitor|display|screen|tv/i, Monitor],
  [/keyboard|mouse|accessor|peripheral/i, Keyboard],
  [/camera|photo/i, Camera],
  [/game|gaming|console/i, Gamepad2],
  [/storage|drive|ssd|memory/i, HardDrive],
  [/network|router|wifi/i, Router],
  [/printer|scanner/i, Printer],
  [/component|cpu|gpu|processor/i, Cpu],
];

// Categories have no imagery in the backend, so pick a representative icon from the name.
export default function categoryIcon(name = '') {
  return RULES.find(([pattern]) => pattern.test(name))?.[1] ?? Boxes;
}
