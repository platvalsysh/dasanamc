import { ChevronDown, Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useSubmit } from "react-router";
import { Button, Input, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui-admin";

interface Category {
    id: string;
    parent_id: string | null;
    name: string;
    path: string | null;
    depth: number;
    list_order: number;
}

interface CategoryTree {
    id: string;
    parent_id: string | null;
    name: string;
    path: string | null;
    depth: number;
    list_order: number;
    children: CategoryTree[];
}

interface CategoryManagerProps {
    moduleId: string;
    categories: Category[];
}

export function CategoryManager({ moduleId, categories }: CategoryManagerProps) {
    const submit = useSubmit();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [parentId, setParentId] = useState<string | null>(null);
    const [newName, setNewName] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    // Build Tree
    const buildTree = (cats: Category[], parentId: string | null = null): CategoryTree[] => {
        return cats
            .filter((c) => c.parent_id === parentId)
            .map((c) => ({
                ...c,
                children: buildTree(cats, c.id),
            }))
            .sort((a, b) => a.list_order - b.list_order);
    };

    const tree = buildTree(categories);

    const handleCreate = (pid: string | null) => {
        setParentId(pid);
        setIsCreating(true);
        setNewName("");
    };

    const submitCreate = () => {
        if (!newName.trim()) return;
        const formData = new FormData();
        formData.append("intent", "createCategory");
        formData.append("name", newName);
        if (parentId) formData.append("parentId", parentId);
        submit(formData, { method: "post" });
        setIsCreating(false);
    };

    const handleEdit = (cat: Category) => {
        setEditingId(cat.id);
        setEditName(cat.name);
    };

    const submitEdit = () => {
        if (!editName.trim()) return;
        const formData = new FormData();
        formData.append("intent", "updateCategory");
        formData.append("categoryId", editingId!);
        formData.append("name", editName);
        submit(formData, { method: "post" });
        setEditingId(null);
    };

    const handleDeleteClick = (id: string, name: string) => {
        setDeleteTarget({ id, name });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        const formData = new FormData();
        formData.append("intent", "deleteCategory");
        formData.append("categoryId", deleteTarget.id);
        submit(formData, { method: "post" });
        setDeleteTarget(null);
    };

    const handleReorder = (id: string, direction: 'up' | 'down') => {
        const formData = new FormData();
        formData.append("intent", "reorderCategory");
        formData.append("categoryId", id);
        formData.append("direction", direction);
        submit(formData, { method: "post", preventScrollReset: true });
    };

    const renderNode = (node: CategoryTree) => {
        const isEditing = editingId === node.id;

        return (
            <div key={node.id} className="ml-4 border-l border-gray-200 pl-4 mt-2">
                <div className="flex items-center gap-2 group">
                    <span className="text-gray-400">
                        {node.children.length > 0 ? <ChevronDown size={14} /> : <div className="w-3.5 h-3.5" />}
                    </span>
                    
                    {isEditing ? (
                        <div className="flex gap-2">
                            <Input
                                autoFocus
                                className="h-8 w-40"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && submitEdit()}
                            />
                            <Button size="sm" onClick={submitEdit}>저장</Button>
                            <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>취소</Button>
                        </div>
                    ) : (
                        <span className="text-sm font-medium">{node.name}</span>
                    )}

                    {!isEditing && (
                        <div className="hidden group-hover:flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(node)} className="h-6 w-6 text-gray-500 hover:text-blue-600"><Edit2 size={12} /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleCreate(node.id)} className="h-6 w-6 text-gray-500 hover:text-green-600"><Plus size={12} /></Button>
                            <div className="w-px h-3 bg-gray-300 mx-1 self-center"></div>
                            <Button variant="ghost" size="icon" onClick={() => handleReorder(node.id, 'up')} className="h-6 w-6 text-gray-500 hover:text-black font-bold text-[10px]">▲</Button>
                            <Button variant="ghost" size="icon" onClick={() => handleReorder(node.id, 'down')} className="h-6 w-6 text-gray-500 hover:text-black font-bold text-[10px]">▼</Button>
                            <div className="w-px h-3 bg-gray-300 mx-1 self-center"></div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(node.id, node.name)} className="h-6 w-6 text-gray-500 hover:text-red-600"><Trash2 size={12} /></Button>
                        </div>
                    )}
                </div>
                {node.children.map(renderNode)}
            </div>
        );
    };

    return (
        <div className="border border-gray-200 p-4 bg-white">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">카테고리 관리</h3>
                <Button
                    onClick={() => handleCreate(null)}
                    size="sm"
                >
                    <Plus size={14} /> 루트 카테고리 추가
                </Button>
            </div>

            <div className="min-h-[100px]">
                {tree.map(renderNode)}
                {tree.length === 0 && <p className="text-gray-500 text-sm italic">등록된 카테고리가 없습니다.</p>}
            </div>

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{parentId ? "하위 카테고리 추가" : "카테고리 추가"}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            autoFocus
                            placeholder="카테고리 이름"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && submitCreate()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreating(false)}>취소</Button>
                        <Button onClick={submitCreate}>추가</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>카테고리 삭제</DialogTitle>
                        <DialogDescription>
                            '{deleteTarget?.name}' 카테고리를 삭제하시겠습니까?
                            <br />
                            하위 카테고리가 있다면 상위 카테고리와의 연결이 끊어질 수 있습니다.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            취소
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                        >
                            삭제
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
