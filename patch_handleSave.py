with open('src/admin/Dashboard.tsx', 'r') as f:
    content = f.read()

target = """    let payload = JSON.parse(JSON.stringify(localConfig));

    setSaving(true);
    try {
      const res = await fetch('/api/config', {"""

replacement = """    let payload = JSON.parse(JSON.stringify(localConfig));

    setSaving(true);
    try {
      if (pendingCharacterPhoto) {
        const formData = new FormData();
        formData.append('file', pendingCharacterPhoto);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
           payload.endScene.character.image = uploadData.url;
           setPendingCharacterPhoto(null);
           setCharacterPhotoPreview(null);
        } else {
           alert('Photo upload failed');
           setSaving(false);
           return;
        }
      }

      const res = await fetch('/api/config', {"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/admin/Dashboard.tsx', 'w') as f:
        f.write(content)
    print("Replaced handleSave")
else:
    print("Target not found")
