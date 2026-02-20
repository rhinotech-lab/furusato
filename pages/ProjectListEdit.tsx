import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDb, BUSINESSES, MUNICIPALITIES, PRODUCTS } from '../services/mockDb';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { ProjectStatus } from '../types';

export const ProjectListEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const basePath =
    currentUser?.role === 'municipality_user'
      ? '/municipality'
      : currentUser?.role === 'business_user'
      ? '/business'
      : '/admin';

  const rowId = Number(id);
  const image = !Number.isNaN(rowId) && rowId > 0 ? mockDb.getImageById(rowId) : undefined;
  const projectFromRow = !Number.isNaN(rowId) && rowId < 0 ? mockDb.getProjectById(Math.abs(rowId)) : undefined;
  const productFromImage = image ? mockDb.getProductById(image.product_id) : undefined;
  const projectFromImageProduct = productFromImage?.project_id ? mockDb.getProjectById(productFromImage.project_id) : undefined;
  const project = projectFromRow || projectFromImageProduct;
  const product = productFromImage || (project ? PRODUCTS.find(p => p.project_id === project.id) : undefined);

  const [projectName, setProjectName] = useState('');
  const [projectDeadline, setProjectDeadline] = useState('');
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('in_progress');
  const [projectDescription, setProjectDescription] = useState('');

  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isNewProduct, setIsNewProduct] = useState(false);

  const [newProductName, setNewProductName] = useState('');
  const [newProductCode, setNewProductCode] = useState('');
  const [newProductDeadline, setNewProductDeadline] = useState('');

  useEffect(() => {
    if (!image && !project) return;
    const business = product ? mockDb.getBusinessById(product.business_id) : undefined;

    setProjectName(project?.name || image?.title || '');
    setProjectDeadline(project?.deadline || '');
    setProjectStatus(project?.status || 'in_progress');
    setProjectDescription(project?.description || '');
    setSelectedBusinessId(product?.business_id?.toString() || '');
    setSelectedProductId(product?.id?.toString() || '');
    setSelectedMunicipalityId(
      project?.municipality_id?.toString() || business?.municipality_id?.toString() || ''
    );
    setNewProductName(product?.name || '');
    setNewProductCode(product?.product_code || '');
    setNewProductDeadline(product?.deadline || '');
  }, [image, product, project]);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'municipality_user' || currentUser.role === 'business_user') {
      setSelectedMunicipalityId(currentUser.municipality_id?.toString() || '');
    }
  }, [currentUser]);

  const filteredBusinesses = useMemo(
    () => BUSINESSES.filter((b) => !selectedMunicipalityId || b.municipality_id.toString() === selectedMunicipalityId),
    [selectedMunicipalityId]
  );

  const filteredProducts = useMemo(
    () => PRODUCTS.filter((p) => !selectedBusinessId || p.business_id.toString() === selectedBusinessId),
    [selectedBusinessId]
  );

  if (!image && !project) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-black text-slate-900 tracking-tighter">編集データが見つかりません</h1>
        <button
          onClick={() => navigate(`${basePath}/images`)}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold"
        >
          一覧に戻る
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName || !selectedMunicipalityId || !selectedBusinessId) return;

    let projectId = project?.id;
    if (projectId) {
      mockDb.updateProject(projectId, {
        name: projectName,
        municipality_id: Number(selectedMunicipalityId),
        status: projectStatus,
        deadline: projectDeadline || undefined,
        description: projectDescription || undefined,
      });
    } else {
      const created = mockDb.addProject({
        name: projectName,
        municipality_id: Number(selectedMunicipalityId),
        status: projectStatus,
        deadline: projectDeadline || undefined,
        description: projectDescription || undefined,
      });
      projectId = created.id;
    }

    let targetProductId = Number(selectedProductId);
    if (isNewProduct) {
      if (!newProductName) return;
      const createdProduct = mockDb.addProduct({
        name: newProductName,
        product_code: newProductCode || undefined,
        deadline: newProductDeadline || undefined,
        business_id: Number(selectedBusinessId),
        project_id: projectId,
        donation_amount: 0,
        portals: [],
      });
      targetProductId = createdProduct.id;
    } else {
      if (!targetProductId) return;
      const selected = mockDb.getProductById(targetProductId);
      if (selected) {
        mockDb.updateProduct(targetProductId, {
          business_id: Number(selectedBusinessId),
          project_id: projectId,
        });
      }
    }

    // 画像がある行のみ一覧画像レコードを更新
    if (image) {
      mockDb.updateImage(image.id, {
        title: projectName,
        product_id: targetProductId || image.product_id,
      });
    }

    navigate(`${basePath}/images`);
  };

  const handleDelete = () => {
    const confirmMessage = '本当にこのプロジェクトを削除しますか？\n関連する商品の紐付けは解除されます。';

    if (!window.confirm(confirmMessage)) return;

    if (project?.id) {
      mockDb.deleteProject(project.id);
      PRODUCTS.filter(p => p.project_id === project.id).forEach(p => {
        mockDb.updateProduct(p.id, { project_id: undefined });
      });
    } else if (image?.id) {
      mockDb.deleteImage(image.id);
    }

    navigate(`${basePath}/images`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`${basePath}/images`)}
          className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors flex items-center justify-center"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">プロジェクト一覧の編集</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-premium overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <div className="flex">
            <div className="flex-1 p-3 text-center font-bold text-[10px] uppercase tracking-widest text-accent bg-blue-50/50 rounded-xl">
              1. 商品選択 / 作成（編集）
            </div>
            <div className="flex-1 p-3 text-center font-bold text-[10px] uppercase tracking-widest text-slate-300">
              2. 画像アップロード（編集対象外）
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1.5">
              プロジェクト名 <span className="text-rose-500">*</span>
            </label>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1.5">
                ステータス
              </label>
              <select
                value={projectStatus}
                onChange={(e) => setProjectStatus(e.target.value as ProjectStatus)}
                className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="not_started">未開始</option>
                <option value="in_progress">進行中</option>
                <option value="completed">完了</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1.5">
                プロジェクト期限 <span className="text-[9px] font-medium opacity-50 ml-1">(任意)</span>
              </label>
              <input
                type="date"
                value={projectDeadline}
                onChange={(e) => setProjectDeadline(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1.5">
              説明 <span className="text-[9px] font-medium opacity-50 ml-1">(任意)</span>
            </label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all resize-y"
              placeholder="プロジェクトの説明を入力"
            />
          </div>

          {(currentUser?.role === 'super_admin' || currentUser?.role === 'creator') && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1.5">自治体</label>
              <select
                value={selectedMunicipalityId}
                onChange={(e) => {
                  setSelectedMunicipalityId(e.target.value);
                  setSelectedBusinessId('');
                  setSelectedProductId('');
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="">選択してください</option>
                {MUNICIPALITIES.map((m) => (
                  <option key={m.id} value={m.id.toString()}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1.5">事業者</label>
            <select
              value={selectedBusinessId}
              disabled={!selectedMunicipalityId}
              onChange={(e) => {
                setSelectedBusinessId(e.target.value);
                setSelectedProductId('');
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="">選択してください</option>
              {filteredBusinesses.map((b) => (
                <option key={b.id} value={b.id.toString()}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewProduct(false)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!isNewProduct ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                既存の商品から選択
              </button>
              <button
                type="button"
                onClick={() => setIsNewProduct(true)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${isNewProduct ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                新規商品を登録
              </button>
            </div>

            {!isNewProduct ? (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">商品</label>
                <select
                  value={selectedProductId}
                  disabled={!selectedBusinessId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">選択してください</option>
                  {filteredProducts.map((p) => (
                    <option key={p.id} value={p.id.toString()}>{p.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    商品名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 text-sm focus:border-accent transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    商品管理番号 <span className="text-[9px] font-medium opacity-50 ml-1">(任意)</span>
                  </label>
                  <input
                    value={newProductCode}
                    onChange={(e) => setNewProductCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 text-sm focus:border-accent transition-all font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    期限 <span className="text-[9px] font-medium opacity-50 ml-1">(任意)</span>
                  </label>
                  <input
                    type="date"
                    value={newProductDeadline}
                    onChange={(e) => setNewProductDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 text-sm focus:border-accent transition-all font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-6 border-t border-slate-100 flex justify-between items-center">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-6 py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-2xl font-black text-sm transition-all shadow-sm active:scale-95"
            title={project?.id ? 'このプロジェクトを削除' : 'この一覧項目を削除'}
          >
            <Trash2 size={14} />
            プロジェクトを削除する
          </button>
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={() => navigate(`${basePath}/images`)}
              className="px-8 py-3 rounded-2xl bg-slate-100 text-slate-500 font-black text-sm hover:bg-slate-200 transition-all"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-slate-800 transition-all"
            >
              <Save size={14} />
              保存する
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
