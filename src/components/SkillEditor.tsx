"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useMantineTheme, Box, ScrollArea, Group, Text, ActionIcon, Button, TextInput, Modal, Stack } from "@mantine/core";
import Editor, { type OnMount } from "@monaco-editor/react";
import {
    IconFile,
    IconFilePlus,
    IconTrash,
    IconX,
    IconChevronRight,
    IconChevronDown,
    IconFolder,
    IconFolderOpen,
    IconSettings,
    IconShieldCheck,
    IconMessageCircle,
    IconFolderPlus
} from "@tabler/icons-react";
import {
    parseSkillFiles,
    serializeSkillFiles,
    serializeSkillFilesToJSON,
    getLanguageFromFilename,
    validateFilename,
    suggestFilename,
    DEFAULT_SKILL_FILE,
    type SkillFile,
} from "@/lib/skill-files";

interface SkillEditorProps {
    value: string | any;
    onChange?: (value: any) => void;
    className?: string;
    style?: React.CSSProperties;
    readOnly?: boolean;
}

// Tree node type for folder structure
interface TreeNode {
    name: string;
    path: string;
    isFolder: boolean;
    children: TreeNode[];
}

// Build a tree structure from flat file paths
function buildFileTree(files: SkillFile[]): TreeNode[] {
    const root: TreeNode[] = [];

    // Filter out files from unwanted directories
    const filteredFiles = files.filter(file => {
        const path = file.filename.toLowerCase();
        // Exclude .github, packages, and other non-skill directories
        const excludeDirs = ['.github/', 'packages/', 'node_modules/', 'dist/', 'build/'];
        return !excludeDirs.some(dir => path.startsWith(dir));
    });

    for (const file of filteredFiles) {
        const parts = file.filename.split("/");
        let currentLevel = root;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLastPart = i === parts.length - 1;
            const currentPath = parts.slice(0, i + 1).join("/");

            let existing = currentLevel.find((n) => n.name === part);

            if (!existing) {
                existing = {
                    name: part,
                    path: currentPath,
                    isFolder: !isLastPart,
                    children: [],
                };
                currentLevel.push(existing);
            }

            if (!isLastPart) {
                currentLevel = existing.children;
            }
        }
    }

    // Sort: folders first, then alphabetically
    const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
        return nodes
            .map((n) => ({ ...n, children: sortNodes(n.children) }))
            .sort((a, b) => {
                if (a.isFolder && !b.isFolder) return -1;
                if (!a.isFolder && b.isFolder) return 1;
                return a.name.localeCompare(b.name);
            });
    };

    return sortNodes(root);
}

// Recursive tree node component
interface TreeNodeItemProps {
    node: TreeNode;
    depth: number;
    activeFile: string;
    expandedFolders: Set<string>;
    onToggleFolder: (path: string) => void;
    onOpenFile: (path: string) => void;
    onDeleteFile: (path: string) => void;
    onAddFile: (basePath?: string) => void;
    onAddFolder: (basePath?: string) => void;
    readOnly?: boolean;
}

function TreeNodeItem({
    node,
    depth,
    activeFile,
    expandedFolders,
    onToggleFolder,
    onOpenFile,
    onDeleteFile,
    onAddFile,
    onAddFolder,
    readOnly,
}: TreeNodeItemProps) {
    const isExpanded = expandedFolders.has(node.path);
    const isActive = activeFile === node.path;
    const paddingLeft = depth * 12 + 12;

    if (node.isFolder) {
        return (
            <Box>
                <Group
                    gap={6}
                    py={4}
                    bg="transparent"
                    style={{
                        paddingLeft: `${paddingLeft}px`,
                        cursor: "pointer",
                        userSelect: "none"
                    }}
                    onClick={() => onToggleFolder(node.path)}
                    onMouseEnter={(e) => {
                        const target = e.currentTarget;
                        target.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                        const actions = target.querySelector('.folder-actions') as HTMLElement | null;
                        if (actions) actions.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                        const target = e.currentTarget;
                        target.style.backgroundColor = "transparent";
                        const actions = target.querySelector('.folder-actions') as HTMLElement | null;
                        if (actions) actions.style.opacity = '0';
                    }}
                >
                    {isExpanded ? (
                        <IconChevronDown size={14} style={{ opacity: 0.5 }} />
                    ) : (
                        <IconChevronRight size={14} style={{ opacity: 0.5 }} />
                    )}
                    {(() => {
                        const iconSize = 16;
                        const isRules = node.path === "rules";
                        const isScripts = node.path === "scripts";
                        const isTests = node.path === "tests";

                        if (isRules) return <IconMessageCircle size={iconSize} color="#22e1fe" />;
                        if (isScripts) return <IconSettings size={iconSize} color="#22e1fe" />;
                        if (isTests) return <IconShieldCheck size={iconSize} color="#22e1fe" />;

                        return isExpanded ? (
                            <IconFolderOpen size={iconSize} color="#22e1fe" />
                        ) : (
                            <IconFolder size={iconSize} color="#22e1fe" />
                        );
                    })()}
                    <Text size="xs" truncate fw={500} style={{ flex: 1 }}>{node.name}</Text>
                    {!readOnly && (
                        <Group gap={2} className="folder-actions" style={{ opacity: 0, transition: 'opacity 0.2s' }}>
                            <ActionIcon
                                size="xs"
                                variant="transparent"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddFile(node.path);
                                }}
                                title="New File"
                            >
                                <IconFilePlus size={12} color="#22e1fe" />
                            </ActionIcon>
                            <ActionIcon
                                size="xs"
                                variant="transparent"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddFolder(node.path);
                                }}
                                title="New Folder"
                            >
                                <IconFolderPlus size={12} color="#22e1fe" />
                            </ActionIcon>
                        </Group>
                    )}
                </Group>
                {isExpanded && (
                    <Box>
                        {node.children.map((child) => (
                            <TreeNodeItem
                                key={child.path}
                                node={child}
                                depth={depth + 1}
                                activeFile={activeFile}
                                expandedFolders={expandedFolders}
                                onToggleFolder={onToggleFolder}
                                onOpenFile={onOpenFile}
                                onDeleteFile={onDeleteFile}
                                onAddFile={onAddFile}
                                onAddFolder={onAddFolder}
                                readOnly={readOnly}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        );
    }

    // File node
    return (
        <Group
            gap={6}
            py={4}
            style={{
                paddingLeft: `${paddingLeft}px`,
                cursor: "pointer",
                position: 'relative',
                backgroundColor: isActive ? "rgba(34, 225, 254, 0.12)" : "transparent",
                borderLeft: isActive ? "2px solid #22e1fe" : "2px solid transparent",
                marginLeft: "-4px" // Offset for the border to keep text aligned
            }}
            onClick={() => onOpenFile(node.path)}
            onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                const btn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                if (btn) btn.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                const btn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                if (btn) btn.style.opacity = '0';
            }}
        >
            <Box w={14} /> {/* Spacer for alignment with chevron */}
            <IconFile size={16} stroke={isActive ? 2 : 1.5} color={isActive ? "#22e1fe" : undefined} style={{ opacity: isActive ? 1 : 0.5 }} />
            <Text size="xs" truncate className={isActive ? "text-bright" : "text-dimmed"} fw={isActive ? 600 : 400} style={{ flex: 1, letterSpacing: '0.2px' }}>
                {node.name}
            </Text>

            {node.path !== DEFAULT_SKILL_FILE && !readOnly && (
                <ActionIcon
                    size="xs"
                    variant="transparent"
                    color="red"
                    className="delete-btn"
                    style={{ opacity: 0, transition: 'opacity 0.2s', marginRight: 4 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(node.path);
                    }}
                >
                    <IconTrash size={12} />
                </ActionIcon>
            )}
        </Group>
    );
}

export function SkillEditor({ value, onChange, className, style, readOnly = false }: SkillEditorProps) {
    const theme = useMantineTheme();
    const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

    // Parse files from the serialized content
    const [files, setFiles] = useState<SkillFile[]>(() => parseSkillFiles(value || ""));
    const [activeFile, setActiveFile] = useState<string>(DEFAULT_SKILL_FILE);
    const [openTabs, setOpenTabs] = useState<string[]>([DEFAULT_SKILL_FILE]);

    // Dialog states
    const [showNewFileDialog, setShowNewFileDialog] = useState(false);
    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
    const [newFilename, setNewFilename] = useState("");
    const [newFolderName, setNewFolderName] = useState("");
    const [creationPath, setCreationPath] = useState<string | null>(null);
    const [filenameError, setFilenameError] = useState<string | null>(null);
    const [folderNameError, setFolderNameError] = useState<string | null>(null);
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);

    // Expanded folders state
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    // Build tree structure from files
    const fileTree = useMemo(() => buildFileTree(files), [files]);

    // Toggle folder expansion
    const toggleFolder = useCallback((folderPath: string) => {
        setExpandedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(folderPath)) {
                next.delete(folderPath);
            } else {
                next.add(folderPath);
            }
            return next;
        });
    }, []);

    // Get the active file's content and language
    const activeFileData = useMemo(
        () => files.find((f) => f.filename === activeFile),
        [files, activeFile]
    );
    const activeLanguage = useMemo(
        () => getLanguageFromFilename(activeFile),
        [activeFile]
    );

    // Debounced onChange to parent
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const debouncedOnChange = useCallback(
        (newFiles: SkillFile[]) => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
                onChange?.(serializeSkillFilesToJSON(newFiles));
            }, 300);
        },
        [onChange]
    );

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // Serialize and propagate changes to parent (debounced)
    const updateFiles = useCallback(
        (newFiles: SkillFile[]) => {
            setFiles(newFiles);
            debouncedOnChange(newFiles);
        },
        [debouncedOnChange]
    );

    // Handle editor content changes
    const handleEditorChange = useCallback(
        (newContent: string | undefined) => {
            if (readOnly || !onChange) return;
            const content = newContent || "";
            const newFiles = files.map((f) =>
                f.filename === activeFile ? { ...f, content } : f
            );
            updateFiles(newFiles);
        },
        [files, activeFile, updateFiles, readOnly, onChange]
    );

    // Open a file in a tab
    const openFile = useCallback((filename: string) => {
        setActiveFile(filename);
        setOpenTabs((prev) =>
            prev.includes(filename) ? prev : [...prev, filename]
        );
    }, []);

    // Close a tab
    const closeTab = useCallback(
        (filename: string, e?: React.MouseEvent) => {
            e?.stopPropagation();
            if (filename === DEFAULT_SKILL_FILE) return; // Can't close SKILL.md

            setOpenTabs((prev) => {
                const newTabs = prev.filter((f) => f !== filename);
                if (activeFile === filename) {
                    setActiveFile(newTabs[newTabs.length - 1] || DEFAULT_SKILL_FILE);
                }
                return newTabs;
            });
        },
        [activeFile]
    );

    // Add a new file
    const handleAddFile = useCallback((basePath?: string) => {
        const suggestion = suggestFilename(files.map((f) => f.filename));
        setNewFilename(suggestion);
        setCreationPath(basePath || null);
        setFilenameError(null);
        setShowNewFileDialog(true);
    }, [files]);

    const handleAddFolder = useCallback((basePath?: string) => {
        setNewFolderName("");
        setCreationPath(basePath || null);
        setFolderNameError(null);
        setShowNewFolderDialog(true);
    }, []);

    const confirmAddFile = useCallback(() => {
        const fullPath = creationPath ? `${creationPath}/${newFilename.trim()}` : newFilename.trim();
        const errorCode = validateFilename(
            fullPath,
            files.map((f) => f.filename)
        );
        if (errorCode) {
            setFilenameError(errorCode === 'duplicate' ? 'Filename already exists' : errorCode === 'empty' ? 'Filename cannot be empty' : 'Invalid characters');
            return;
        }

        const trimmed = newFilename.trim();
        const finalPath = creationPath ? `${creationPath}/${trimmed}` : trimmed;

        // Support creating files in folders
        const newFiles = [...files, { filename: finalPath, content: "" }];
        updateFiles(newFiles);
        openFile(finalPath);

        // Auto-expand parent folders
        if (finalPath.includes("/")) {
            const parts = finalPath.split("/");
            let current = "";
            for (let i = 0; i < parts.length - 1; i++) {
                current = current ? `${current}/${parts[i]}` : parts[i];
                setExpandedFolders(prev => new Set(prev).add(current));
            }
        }

        setShowNewFileDialog(false);
        setNewFilename("");
        setCreationPath(null);
    }, [newFilename, files, updateFiles, openFile, creationPath]);

    const confirmAddFolder = useCallback(() => {
        if (!newFolderName.trim()) {
            setFolderNameError("Folder name cannot be empty");
            return;
        }

        const trimmed = newFolderName.trim();
        const finalPath = creationPath ? `${creationPath}/${trimmed}` : trimmed;

        // Folders are implicit in our flat file structure, 
        // but we can create a dummy file to ensure the folder shows up if it's empty,
        // or just let it be created once a file is added to it.
        // Actually, let's create a .gitkeep or a blank SKILL.md if it's a new root folder,
        // but for now, we'll just expand it if we create a file inside.
        // To truly "create a folder" in a flat list without a file is tricky,
        // so we'll add a file like `${finalPath}/.gitkeep` to make it visible.

        const gitKeepPath = `${finalPath}/.gitkeep`;
        if (files.some(f => f.filename.startsWith(finalPath + "/"))) {
            setFolderNameError("Folder already exists or conflict");
            return;
        }

        const newFiles = [...files, { filename: gitKeepPath, content: "" }];
        updateFiles(newFiles);

        // Expand the new folder
        setExpandedFolders(prev => new Set(prev).add(finalPath));
        if (creationPath) {
            setExpandedFolders(prev => new Set(prev).add(creationPath));
        }

        setShowNewFolderDialog(false);
        setNewFolderName("");
        setCreationPath(null);
    }, [newFolderName, files, updateFiles, creationPath]);

    // Delete a file
    const handleDeleteFile = useCallback((filename: string) => {
        if (filename === DEFAULT_SKILL_FILE) return;
        setFileToDelete(filename);
    }, []);

    const confirmDeleteFile = useCallback(() => {
        if (!fileToDelete || fileToDelete === DEFAULT_SKILL_FILE) return;

        const newFiles = files.filter((f) => f.filename !== fileToDelete);
        updateFiles(newFiles);
        closeTab(fileToDelete);
        setFileToDelete(null);
    }, [fileToDelete, files, updateFiles, closeTab]);

    // Re-parse when external value changes significantly
    useEffect(() => {
        if (!value) return;

        // Simple check to avoid loop - check if JSON strings match
        const currentJSON = JSON.stringify(serializeSkillFilesToJSON(files));
        const incomingJSON = typeof value === 'string' ? value : JSON.stringify(value);

        if (incomingJSON !== currentJSON) {
            const parsed = parseSkillFiles(value);
            if (parsed.length > 0) {
                setFiles(parsed);
                if (!parsed.find(f => f.filename === activeFile)) {
                    setActiveFile(DEFAULT_SKILL_FILE);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleEditorMount: OnMount = useCallback((editor) => {
        editorRef.current = editor;
    }, []);

    return (
        <Box className={className} style={{ display: 'flex', height: 500, border: `1px solid rgba(255, 255, 255, 0.1)`, borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden', backgroundColor: '#0d1117', ...style }}>
            {/* Sidebar */}
            <Box w={240} style={{ borderRight: `1px solid rgba(255, 255, 255, 0.1)`, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                <Group p="sm" justify="space-between" style={{ borderBottom: `1px solid rgba(255, 255, 255, 0.1)` }}>
                    <Group gap={6}>
                        <IconFolder size={16} color="#22e1fe" />
                        <Text size="xs" fw={700} tt="uppercase" className="text-bright" style={{ letterSpacing: '0.5px' }}>Explorer</Text>
                    </Group>
                    {!readOnly && (
                        <Group gap={4}>
                            <ActionIcon size="xs" variant="subtle" onClick={() => handleAddFile()} title="New File">
                                <IconFilePlus size={14} />
                            </ActionIcon>
                            <ActionIcon size="xs" variant="subtle" onClick={() => handleAddFolder()} title="New Folder">
                                <IconFolderPlus size={14} />
                            </ActionIcon>
                        </Group>
                    )}
                </Group>

                <ScrollArea style={{ flex: 1 }}>
                    <Box p={4}>
                        {fileTree.map((node) => (
                            <TreeNodeItem
                                key={node.path}
                                node={node}
                                depth={0}
                                activeFile={activeFile}
                                expandedFolders={expandedFolders}
                                onToggleFolder={toggleFolder}
                                onOpenFile={openFile}
                                onDeleteFile={handleDeleteFile}
                                onAddFile={handleAddFile}
                                onAddFolder={handleAddFolder}
                                readOnly={readOnly}
                            />
                        ))}
                    </Box>
                </ScrollArea>
            </Box>

            {/* Main Content */}
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Tabs */}
                <Box style={{ borderBottom: `1px solid rgba(255, 255, 255, 0.1)`, overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    {openTabs.map((filename) => (
                        <Group
                            key={filename}
                            gap={6}
                            px="md"
                            py={8}
                            style={{
                                cursor: 'pointer',
                                borderRight: `1px solid rgba(255, 255, 255, 0.1)`,
                                backgroundColor: activeFile === filename ? '#0d1117' : 'rgba(0,0,0,0.2)',
                                borderBottom: activeFile === filename ? '2px solid #22e1fe' : 'none',
                                borderTop: activeFile === filename ? '1px solid rgba(34, 225, 254, 0.3)' : 'none',
                                marginBottom: -1,
                                height: '100%',
                                minWidth: 'fit-content',
                                flexShrink: 0,
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => setActiveFile(filename)}
                        >
                            <IconFile size={14} style={{ opacity: 0.5 }} />
                            <Text size="xs" style={{ whiteSpace: 'nowrap' }}>{filename}</Text>
                            {filename !== DEFAULT_SKILL_FILE && (
                                <ActionIcon
                                    size={14}
                                    variant="transparent"
                                    color="gray"
                                    onClick={(e) => closeTab(filename, e)}
                                    style={{ marginLeft: 4 }}
                                >
                                    <IconX size={10} />
                                </ActionIcon>
                            )}
                        </Group>
                    ))}
                </Box>

                {/* Editor */}
                <Box style={{ flex: 1, position: 'relative' }}>
                    <Editor
                        height="100%"
                        language={activeLanguage}
                        value={activeFileData?.content || ""}
                        onChange={handleEditorChange}
                        onMount={handleEditorMount}
                        theme="vs-dark"
                        options={{
                            readOnly: readOnly,
                            minimap: { enabled: false },
                            fontSize: 13,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 16 }
                        }}
                    />
                </Box>
            </Box>

            {/* New File Modal */}
            <Modal opened={showNewFileDialog} onClose={() => setShowNewFileDialog(false)} title="Add New File" centered size="sm">
                <Stack>
                    <TextInput
                        label="Filename"
                        placeholder="example.ts"
                        value={newFilename}
                        onChange={(e) => {
                            setNewFilename(e.target.value);
                            setFilenameError(null);
                        }}
                        error={filenameError}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmAddFile();
                        }}
                        data-autofocus
                    />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => setShowNewFileDialog(false)}>Cancel</Button>
                        <Button onClick={confirmAddFile} color="cyan">Create File</Button>
                    </Group>
                </Stack>
            </Modal>

            {/* New Folder Modal */}
            <Modal opened={showNewFolderDialog} onClose={() => setShowNewFolderDialog(false)} title="Add New Folder" centered size="sm">
                <Stack>
                    <TextInput
                        label="Folder Name"
                        placeholder="my-folder"
                        value={newFolderName}
                        onChange={(e) => {
                            setNewFolderName(e.target.value);
                            setFolderNameError(null);
                        }}
                        error={folderNameError}
                        description={creationPath ? `Creating in: ${creationPath}` : undefined}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmAddFolder();
                        }}
                        data-autofocus
                    />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => setShowNewFolderDialog(false)}>Cancel</Button>
                        <Button onClick={confirmAddFolder} color="cyan">Create Folder</Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal opened={!!fileToDelete} onClose={() => setFileToDelete(null)} title="Delete File" centered size="sm">
                <Text size="sm" mb="lg">Are you sure you want to delete <b>{fileToDelete}</b>? This action cannot be undone.</Text>
                <Group justify="flex-end">
                    <Button variant="default" onClick={() => setFileToDelete(null)}>Cancel</Button>
                    <Button color="red" onClick={confirmDeleteFile}>Delete</Button>
                </Group>
            </Modal>

        </Box>
    );
}
