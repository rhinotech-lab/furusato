
import React, { useState, useMemo } from 'react';
import { mockDb, MUNICIPALITIES } from '../services/mockDb';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Building2, 
  Edit, 
  ArrowRight, 
  Brain, 
  Map as MapIcon, 
  ChevronRight, 
  X,
  Filter,
  Snowflake,
  Mountain,
  Landmark,
  Waves,
  Sun,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PREFECTURES = [
  { region: '北海道・東北', names: ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'], icon: Snowflake },
  { region: '関東', names: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'], icon: Landmark },
  { region: '中部', names: ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'], icon: Mountain },
  { region: '関西', names: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'], icon: Landmark },
  { region: '中国・四国', names: ['鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県'], icon: Waves },
  { region: '九州・沖縄', names: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'], icon: Sun },
];

export const MunicipalityList: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPref, setSelectedPref] = useState<string | null>(null);

  const filteredMunicipalities = useMemo(() => {
    return MUNICIPALITIES.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.code.includes(searchTerm);
      const matchPref = !selectedPref || m.name.startsWith(selectedPref);
      return matchSearch && matchPref;
    });
  }, [searchTerm, selectedPref]);

  const basePath = currentUser?.role === 'municipality_user' ? '/municipality' : '/admin';

  return (
    <div className="space-y-8 animate-in fade-in duration-700 px-8 lg:px-12 pt-8 pb-12 h-full flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
              <span>マスター管理</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">自治体一覧</h1>
        </div>
        <Link to="/admin/municipalities/new" className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl active:scale-95">
          <Plus size={20} /> 新規登録
        </Link>
      </div>

      {/* 都道府県フィルターセクション */}
      <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden shrink-0">
        <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <MapIcon size={18} />
             </div>
             <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">都道府県で絞り込む</h3>
          </div>
          {selectedPref && (
            <button 
              onClick={() => setSelectedPref(null)}
              className="flex items-center gap-2 px-4 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors"
            >
              <X size={14} /> 選択解除: {selectedPref}
            </button>
          )}
        </div>
        <div className="p-8 space-y-8 overflow-x-auto scrollbar-hide">
          {PREFECTURES.map((group) => (
            <div key={group.region} className="flex items-start gap-8 min-w-[800px]">
              <div className="w-40 shrink-0 flex items-center gap-3 pt-1 text-slate-400">
                <group.icon size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{group.region}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.names.map(name => {
                  const hasData = MUNICIPALITIES.some(m => m.name.startsWith(name));
                  const isActive = selectedPref === name;
                  return (
                    <button
                      key={name}
                      onClick={() => setSelectedPref(isActive ? null : name)}
                      className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all border whitespace-nowrap ${
                        isActive 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105 z-10' 
                          : hasData 
                            ? 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400 hover:text-indigo-600' 
                            : 'bg-slate-50 text-slate-300 border-transparent cursor-default'
                      }`}
                    >
                      {name}
                      {hasData && !isActive && <span className="ml-1 w-1 h-1 bg-indigo-400 rounded-full inline-block mb-0.5"></span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 検索バー */}
      <div className="bg-white p-5 rounded-[2rem] shadow-premium border border-slate-100 shrink-0">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="自治体名、または自治体コードでキーワード検索..." 
            className="w-full pl-14 pr-5 py-4 bg-slate-50 border-0 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-accent/5 transition-all text-sm font-bold text-slate-700" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* 自治体リストテーブル */}
      <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-auto scrollbar-hide flex-1">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-50/80 backdrop-blur-md text-slate-400 shadow-sm">
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 w-48">コード</th>
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">自治体名</th>
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-center border-b border-slate-100 w-64">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMunicipalities.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-10 py-32 text-center text-slate-300 font-black text-lg">
                    該当する自治体が見つかりませんでした
                  </td>
                </tr>
              ) : filteredMunicipalities.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 font-mono text-slate-400 text-[13px] font-bold tracking-wider">
                        <MapPin size={14} className="text-slate-200" />
                        {m.code}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-accent transition-colors">
                            {m.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 opacity-60">Registered Municipality</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Link 
                        to={`${basePath}/analysis?id=${m.id}`} 
                        className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all group/ai shadow-sm active:scale-95"
                        title="傾向分析AIを開く"
                      >
                        <Brain size={22} className="group-hover/ai:scale-110 transition-transform" />
                      </Link>
                      <Link 
                        to={`/admin/municipalities/${m.id}/edit`} 
                        className="inline-flex items-center justify-center w-12 h-12 bg-slate-50 text-slate-300 hover:text-slate-600 rounded-2xl hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
                        title="基本情報編集"
                      >
                        <Edit size={22} />
                      </Link>
                      <Link 
                        to={`/admin/businesses/municipality/${m.id}`} 
                        className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-accent rounded-2xl hover:bg-accent hover:text-white transition-all group/btn shadow-sm active:scale-95"
                        title="事業者一覧を表示"
                      >
                        <ArrowRight size={22} strokeWidth={3} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
