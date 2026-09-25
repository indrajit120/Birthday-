with open('src/admin/Dashboard.tsx', 'r') as f:
    content = f.read()

target = """  const [activeTab, setActiveTab] = useState('general');
  const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (globalConfig) setLocalConfig(JSON.parse(JSON.stringify(globalConfig)));
  }, [globalConfig]);"""

replacement = """  const [activeTab, setActiveTab] = useState('general');
  const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);
  const [pendingCharacterPhoto, setPendingCharacterPhoto] = useState<File | null>(null);
  const [characterPhotoPreview, setCharacterPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (globalConfig) setLocalConfig(JSON.parse(JSON.stringify(globalConfig)));
  }, [globalConfig]);"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/admin/Dashboard.tsx', 'w') as f:
        f.write(content)
    print("Replaced state")
else:
    print("Target not found")
