import { useState } from 'react';
import client from '../../../api/client';
import { type UserTag, type MasterTag } from '../../../types';

import { Button } from "../../../shared/ui/button/Button";
import { Input } from "../../../shared/ui/input/Input";
import { Select } from "../../../shared/ui/select/Select";


// スタイルを外出し
import '../style.css';

interface Props {
    userTags: UserTag[];
    masterTags: MasterTag[];
    onTagAdded: () => void;
}

export const UserTagManagement = ({ userTags, masterTags, onTagAdded }: Props) => {
    const [newTagName, setNewTagName] = useState('');
    const [selectedMasterId, setSelectedMasterId] = useState<number>(masterTags[0]?.id || 1);

    const handleAddTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagName.trim()) return;

        try {
            await client.post('UserTags', {
                name: newTagName,
                masterTagId: selectedMasterId,
                userId: 1
            });
            setNewTagName('');
            onTagAdded();
        } catch (err) {
            alert("タグの追加に失敗しました。");
        }
    };

    return (
        <div className="tag-mgmt-container">
            <h3 className="tag-mgmt-title">ユーザータグ管理</h3>

            {/* フォームエリア */}
            <form onSubmit={handleAddTag} className="tag-mgmt-form">
                <div className="tag-input-group">
                    <Select
                        value={selectedMasterId}
                        onChange={(e) => setSelectedMasterId(Number(e.target.value))}
                        className="tag-master-select"
                        // ↓ ここを修正：マスタータグを options 形式に変換して渡す
                        options={masterTags.map(mt => ({
                            value: mt.id,
                            label: mt.name
                        }))}
                    />
                    <Input
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="新しいタグ名..."
                        className="tag-name-input"
                    />

                    <Button type="submit" variant="primary" className="tag-add-btn">
                        追加
                    </Button>
                </div>
            </form>

            {/* 表示エリア：スクロール可能 */}
            <div className="tag-list-scroll-area">
                {masterTags.map(mt => (
                    <div key={mt.id} className="tag-master-group">
                        <div className="tag-master-label">
                            {mt.name}
                        </div>

                        <div className="tag-badge-container">
                            {userTags
                                .filter(ut => ut.masterTagId === mt.id)
                                .map(tag => (
                                    <span key={tag.id} className="user-tag-badge">
                                        # {tag.name}
                                    </span>
                                ))
                            }
                            {userTags.filter(ut => ut.masterTagId === mt.id).length === 0 && (
                                <span className="no-tags-placeholder">
                                    タグがありません
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};