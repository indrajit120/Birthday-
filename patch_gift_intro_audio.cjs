const fs = require('fs');
let code = fs.readFileSync('src/components/GiftIntro.tsx', 'utf8');

// Update props interface
code = code.replace(
  "export default function GiftIntro({ onOpen, recipientName }: { onOpen: () => void, recipientName: string }) {",
  "export default function GiftIntro({ onOpen, onInteractionStart, recipientName }: { onOpen: () => void, onInteractionStart: () => void, recipientName: string }) {"
);

// Call onInteractionStart synchronously inside handleUnwrap
const oldHandleUnwrap = `  const handleUnwrap = () => {
    if (isUnwrapping) return;
    setIsUnwrapping(true);`;
    
const newHandleUnwrap = `  const handleUnwrap = () => {
    if (isUnwrapping) return;
    setIsUnwrapping(true);
    onInteractionStart();`;
    
code = code.replace(oldHandleUnwrap, newHandleUnwrap);

fs.writeFileSync('src/components/GiftIntro.tsx', code);
