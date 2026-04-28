import { useState, useEffect, useCallback } from "react";
import { Label, Input } from "@repo/ui-admin";
import { RotateCw } from "lucide-react";

/**
 * @name "카카오 버튼타입"
 */
export type KakaoButtonType =
  | 'WL'
  | 'AL'
  | 'BK'
  | 'MD'
  | 'DS'
  | 'BC'
  | 'BT'
  | 'AC';

export type KakaoWebButton = {
  buttonName: string;
  buttonType: Extract<KakaoButtonType, 'WL'>;
  linkMo: string;
  linkPc?: string | null;
  linkAnd?: never;
  linkIos?: never;
};

export type KakaoAppButton = {
  buttonName: string;
  buttonType: Extract<KakaoButtonType, 'AL'>;
  linkMo?: never;
  linkPc?: never;
  linkAnd: string;
  linkIos: string;
};

export type KakaoDefaultButton = {
  buttonName: string;
  buttonType: Exclude<KakaoButtonType, 'WL' | 'AL'>;
  linkMo?: never;
  linkPc?: never;
  linkAnd?: never;
  linkIos?: never;
};

export type KakaoButton = KakaoWebButton | KakaoAppButton | KakaoDefaultButton;


export type KakaoAlimtalkTemplateItemType = {
  list: Array<{
    title: string;
    description: string;
  }>;
  summary: {
    title?: string | null;
    description?: string | null;
  };
};

export interface AlimtalkTemplate {
  templateId: string;
  /**
   * @description 템플릿 제목
   */
  name: string;
  /**
   * @description 알림톡 템플릿 내용
   */
  content: string;
  channelId: string;
  channelGroupId: string | null;
  isHidden: boolean;
  /**
   * @description 카카오 알림톡 템플릿 메시지 유형<br>
   * BA:기본형, EX:부가정보형, AD:광고추가형, MI: 복합형
   */
  messageType: 'BA' | 'EX' | 'AD' | 'MI';
  /**
   * @description 카카오 알림톡 템플릿 강조 유형<br>
   * NONE: 선택안함(기본형), TEXT: 강조표기형, IMAGE: 이미지형, ITEM_LIST: 아이템리스트형
   */
  emphasizeType: 'NONE'| 'TEXT'| 'IMAGE'| 'ITEM_LIST';
  /**
   * @description 부가정보. 메시지 유형이 "부가정보형"또는 "복합형"일 경우 필수
   */
  extra: string | null;
  /**
   * @description 간단 광고 문구. 메시지 유형이 "광고추가형"또는 "복합형"일 경우 필수
   */
  ad: string | null;
  /**
   * @description 강조표기 핵심문구(변수사용가능, emphasizeType이 TEXT일 경우 필수 값). 템플릿 내용에 강조표기할 핵심문구가 동일하게 포함되어 있어야합니다.
   */
  emphasizeTitle: string | null;
  /**
   * @description 강조표기 보조문구(emphasizeType이 TEXT일 경우 필수 값). 템플릿 내용에 강조표기할 보조문구가 동일하게 포함되어 있어야합니다.
   */
  emphasizeSubtitle: string | null;
  securityFlag: boolean;
  imageId: string | null;
  assignType: string;
  /**
   * @description 카카오 알림톡 템플릿 버튼 목록
   */
  buttons?: KakaoButton[];
  comments?: {
    isAdmin: boolean;
    memberId: string;
    content: string | null;
    dateCreated: string;
  }[];
  commentable: boolean;
  quickReplies: any[];
  /**
   * @description 아이템 리스트 용 헤더
   */
  header: string | null;
  /**
   * @description 아이템 리스트용 하이라이트 정보 유형
   */
  highlight: {
    title: string | null;
    description: string | null;
    imageId: string | null;
  };
  item?: KakaoAlimtalkTemplateItemType | null;
  code: string;
  status: string;
  variables: { name: string }[];
  dateCreated: string;
  dateUpdated: string;
}

interface AlimtalkTemplateSelectorProps {
  onSelectionChange: (template: AlimtalkTemplate | null, variables: Record<string, string>, variablesExtra: Record<string, string>) => void;
}

const getSubstitutedContent = (content: string, vars: Record<string, string>, hidden: Record<string, boolean>) => {
  if (!content) return "";
  let result = content;
  const allKeys = Object.keys({ ...vars, ...hidden });
  allKeys.forEach(v => {
    if (v) {
      const value = hidden[v] ? "" : (vars[v] || v);
      result = result.replaceAll(v, value);
    }
  });
  return result;
};

type ViewMode = 'preview' | 'original' | 'failover';

interface ViewProps {
  template: AlimtalkTemplate;
  variables: Record<string, string>;
  variablesHidden: Record<string, boolean>;
  imageUrl?: string | null;
  highlightImageUrl?: string | null;
  variablesExtra?: Record<string, string>;
}

const AlimtalkPreviewView = ({ template, variables, variablesHidden, imageUrl, highlightImageUrl }: ViewProps) => {
  const previewContent = getSubstitutedContent(template.content, variables, variablesHidden);
  const previewExtra = template.extra || "";
  
  // 강조표기형 (TEXT)
  const previewSubtitle = template.emphasizeType === 'TEXT' ? getSubstitutedContent(template.emphasizeSubtitle || "", variables, variablesHidden) : "";
  const previewTitle = template.emphasizeType === 'TEXT' ? getSubstitutedContent(template.emphasizeTitle || "", variables, variablesHidden) : "";

  // 아이템리스트형 (ITEM_LIST)
  const previewHeader = template.emphasizeType === 'ITEM_LIST' ? getSubstitutedContent(template.header || "", variables, variablesHidden) : "";
  const highlightTitle = template.emphasizeType === 'ITEM_LIST' ? getSubstitutedContent(template.highlight?.title || "", variables, variablesHidden) : "";
  const highlightDesc = template.emphasizeType === 'ITEM_LIST' ? getSubstitutedContent(template.highlight?.description || "", variables, variablesHidden) : "";

  return (
    <div className="text-sm bg-white rounded border border-blue-100 shadow-inner overflow-hidden">
      {/* 1. 이미지형 플레이스홀더 또는 실제 이미지 (imageId 가 있을 때) - 가장 위쪽에 배치 */}
      {template.imageId && (
        <div className="bg-gray-100 flex items-center justify-center border-b border-gray-100 relative overflow-hidden group">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="메시지 이미지" 
              className="w-full h-full object-cover max-h-[300px]" 
            />
          ) : (
            <div className="aspect-[2/1] w-full flex flex-col items-center justify-center gap-2 text-gray-400">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent pointer-events-none" />
              <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] font-medium tracking-widest uppercase opacity-40">IMAGE AREA</span>
            </div>
          )}
        </div>
      )}

      {/* 2. 헤더 영역 (TEXT 강조표기형 또는 ITEM_LIST 헤더) */}
      {(template.emphasizeType === 'TEXT' && (previewSubtitle || previewTitle)) && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/30">
          {previewSubtitle && <div className="text-[11px] text-gray-400 mb-0.5">{previewSubtitle}</div>}
          {previewTitle && <div className="text-[15px] font-bold text-gray-800 leading-snug">{previewTitle}</div>}
        </div>
      )}
      {template.emphasizeType === 'ITEM_LIST' && previewHeader && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/30 font-bold text-gray-800">
          {previewHeader}
        </div>
      )}
      
      {/* 2. 아이템리스트 하이라이트 영역 */}
      {template.emphasizeType === 'ITEM_LIST' && (highlightTitle || highlightDesc || highlightImageUrl) && (
        <div className="px-4 py-3 border-b border-gray-50 bg-white flex gap-3 items-center">
          {highlightImageUrl && (
             <img src={highlightImageUrl} alt="하이라이트" className="w-12 h-12 rounded object-cover border" />
          )}
          <div className="flex-1">
            {highlightTitle && <div className="text-[13px] font-bold text-gray-700">{highlightTitle}</div>}
            {highlightDesc && <div className="text-[12px] text-gray-500">{highlightDesc}</div>}
          </div>
        </div>
      )}

      {/* 3. 아이템리스트 상세 내역 */}
      {template.emphasizeType === 'ITEM_LIST' && template.item && (
        <div className="px-4 py-3 border-b border-gray-50 bg-white space-y-1">
          {template.item.list?.map((item, idx) => (
            <div key={idx} className="flex justify-between text-[12px]">
              <span className="text-gray-400">{getSubstitutedContent(item.title, variables, variablesHidden)}</span>
              <span className="text-gray-700 font-medium">{getSubstitutedContent(item.description, variables, variablesHidden)}</span>
            </div>
          ))}
          {template.item.summary && template.item.summary.title && template.item.summary.description && (
            <div className="flex justify-between text-[13px] font-bold pt-1 border-t border-gray-50">
              <span className="text-gray-800">{getSubstitutedContent(template.item.summary.title || "", variables, variablesHidden)}</span>
              <span className="text-blue-600 font-black">{getSubstitutedContent(template.item.summary.description || "", variables, variablesHidden)}</span>
            </div>
          )}
        </div>
      )}

      {/* 4. 본문 내용 */}
      <div className="p-4 whitespace-pre-wrap min-h-[60px] leading-relaxed">
        {previewContent}
      </div>

      {/* 5. 부가정보 (Extra) - 변수 사용 불가 */}
      {previewExtra && (
        <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 text-[11px] text-gray-400 italic">
          {previewExtra}
        </div>
      )}
    </div>
  );
};

const AlimtalkOriginalView = ({ template, imageUrl, highlightImageUrl }: { template: AlimtalkTemplate, imageUrl?: string | null, highlightImageUrl?: string | null }) => (
  <div className="text-sm bg-white rounded border border-blue-100 shadow-inner overflow-hidden">
    {/* 이미지형 플레이스홀더 또는 실제 이미지 (imageId 가 있을 때) - 가장 위쪽에 배치 */}
    {template.imageId && (
      <div className="bg-gray-100 flex items-center justify-center border-b border-gray-100 relative overflow-hidden group">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="메시지 이미지" 
            className="w-full h-full object-cover max-h-[300px]" 
          />
        ) : (
          <div className="aspect-[2/1] w-full flex flex-col items-center justify-center gap-2 text-gray-400">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent pointer-events-none" />
            <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-medium tracking-widest uppercase opacity-40">IMAGE AREA</span>
          </div>
        )}
      </div>
    )}

    {/* TEXT 강조표기형 헤더 */}
    {template.emphasizeType === 'TEXT' && (template.emphasizeSubtitle || template.emphasizeTitle) && (
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/30">
        {template.emphasizeSubtitle && <div className="text-[11px] text-gray-400 mb-0.5">{template.emphasizeSubtitle}</div>}
        {template.emphasizeTitle && <div className="text-[15px] font-bold text-gray-800 leading-snug">{template.emphasizeTitle}</div>}
      </div>
    )}
    
    {/* ITEM_LIST 헤더 */}
    {template.emphasizeType === 'ITEM_LIST' && template.header && (
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/30 font-bold text-gray-800">
        {template.header}
      </div>
    )}

    {/* ITEM_LIST 하이라이트 */}
    {template.emphasizeType === 'ITEM_LIST' && (template.highlight?.title || template.highlight?.description || highlightImageUrl) && (
      <div className="px-4 py-3 border-b border-gray-50 bg-white flex gap-3 items-center">
        {highlightImageUrl && (
           <img src={highlightImageUrl} alt="하이라이트" className="w-12 h-12 rounded object-cover border" />
        )}
        <div className="flex-1">
          {template.highlight?.title && <div className="text-[13px] font-bold text-gray-700">{template.highlight.title}</div>}
          {template.highlight?.description && <div className="text-[12px] text-gray-500">{template.highlight.description}</div>}
        </div>
      </div>
    )}

    {/* ITEM_LIST 상세 내역 */}
    {template.emphasizeType === 'ITEM_LIST' && template.item && (
      <div className="px-4 py-3 border-b border-gray-50 bg-white space-y-1">
        {template.item.list?.map((item, idx) => (
          <div key={idx} className="flex justify-between text-[12px]">
            <span className="text-gray-400">{item.title}</span>
            <span className="text-gray-700 font-medium">{item.description}</span>
          </div>
        ))}
        {template.item.summary && template.item.summary.title && template.item.summary.description && (
          <div className="flex justify-between text-[13px] font-bold pt-1 border-t border-gray-50">
            <span className="text-gray-800">{template.item.summary.title}</span>
            <span className="text-blue-600 font-black">{template.item.summary.description}</span>
          </div>
        )}
      </div>
    )}

    <div className="p-4 whitespace-pre-wrap min-h-[60px] leading-relaxed">
      {template.content}
    </div>

    {/* 부가정보 (Extra) */}
    {template.extra && (
      <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 text-[11px] text-gray-400 italic">
        {template.extra}
      </div>
    )}
  </div>
);

const AlimtalkFailoverView = ({ template, variables, variablesHidden, variablesExtra }: ViewProps) => {
  const parts: string[] = [];

  // 0. 추가 변수 (말머리)
  if (variablesExtra) {
    const extraParts: string[] = [];
    if (variablesExtra.persistentPrefix) extraParts.push(variablesExtra.persistentPrefix);
    if (variablesExtra.selectivePrefix) extraParts.push(variablesExtra.selectivePrefix);
    
    if (extraParts.length > 0) {
      parts.push(...extraParts);
    }
  }

  // 1. Header 영역
  if (template.emphasizeType === 'TEXT') {
    if (template.emphasizeSubtitle) parts.push(template.emphasizeSubtitle);
    if (template.emphasizeTitle) parts.push(template.emphasizeTitle);
    if (template.emphasizeSubtitle || template.emphasizeTitle) parts.push("");
  } else if (template.emphasizeType === 'ITEM_LIST' && template.header) {
    parts.push(template.header);
    parts.push("");
  }

  // 2. 아이템리스트 하이라이트
  if (template.emphasizeType === 'ITEM_LIST' && template.highlight) {
    if (template.highlight.title) parts.push(template.highlight.title);
    if (template.highlight.description) parts.push(template.highlight.description);
    if (template.highlight.title || template.highlight.description) parts.push("");
  }

  // 3. 아이템리스트 상세
  if (template.emphasizeType === 'ITEM_LIST' && template.item) {
    template.item.list?.forEach((item: any) => {
      parts.push(`${item.title}: ${item.description}`);
    });
    if (template.item.summary && template.item.summary.title && template.item.summary.description) {
      parts.push(`${template.item.summary.title}: ${template.item.summary.description}`);
    }
    parts.push("");
  }

  // 4. 본문 내용
  parts.push(template.content ?? "");

  // 5. 부가정보 (Extra)
  if (template.extra) {
    parts.push("\n" + template.extra);
  }

  const failoverText = parts.join("\n");

  const replacementsText = getSubstitutedContent(failoverText, variables, variablesHidden)

  return (
    <div className="text-sm bg-gray-50 rounded border border-gray-200 shadow-inner overflow-hidden">
      <div className="p-3 whitespace-pre-wrap min-h-[100px] font-mono text-[12px] text-gray-600">
        {replacementsText}
      </div>
    </div>
  );
};

export function AlimtalkTemplateSelector({ onSelectionChange }: AlimtalkTemplateSelectorProps) {
  const [templates, setTemplates] = useState<AlimtalkTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [template, setTemplate] = useState<AlimtalkTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [variablesHidden, setVariablesHidden] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [highlightImageUrl, setHighlightImageUrl] = useState<string | null>(null);
  const [variablesExtra, setVariablesExtra] = useState<Record<string, string>>({
    persistentPrefix: "",
    selectivePrefix: ""
  });
  const [savingConfig, setSavingConfig] = useState(false);

  const fetchFailoverConfig = useCallback(() => {
    fetch("/admin/api/sms/failover-config")
      .then(res => res.json())
      .then(res => {
        if (res.success && res.config) {
          setVariablesExtra(prev => ({ 
            ...prev, 
            persistentPrefix: res.config.persistentPrefix || "" 
          }));
        }
      })
      .catch(err => console.error("Failed to fetch failover config", err));
  }, []);

  const saveFailoverConfig = useCallback(() => {
    setSavingConfig(true);
    const body = new FormData();
    body.append("config", JSON.stringify({ persistentPrefix: variablesExtra.persistentPrefix }));
    fetch("/admin/api/sms/failover-config", { method: "POST", body })
      .then(res => res.json())
      .then(res => {
        if (res.success) alert("저장되었습니다.");
        else alert("저장 실패: " + res.error);
      })
      .catch(err => alert("저장 오류: " + err.message))
      .finally(() => setSavingConfig(false));
  }, [variablesExtra.persistentPrefix]);

  const fetchTemplates = useCallback(() => {
    setLoadingTemplates(true);
    fetch("/admin/api/bxmember/member/kakao/templates", { method: "POST", body: new FormData() })
      .then(res => res.json())
      .then(res => {
        if (res.success) setTemplates(res.templates);
      })
      .finally(() => setLoadingTemplates(false));
  }, []);

  // Fetch Template List on mount
  useEffect(() => {
    fetchTemplates();
    fetchFailoverConfig();
  }, [fetchTemplates, fetchFailoverConfig]);

  // Handle Selection
  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id);
    const selected = templates.find(t => t.templateId === id) || null;
    
    if (selected) {
      setTemplate(selected);
      const initialVars: Record<string, string> = {};
      const initialHidden: Record<string, boolean> = {};
      selected.variables?.forEach(v => {
        initialVars[v.name] = "";
        initialHidden[v.name] = false;
      });
      setVariables(initialVars);
      setVariablesHidden(initialHidden);

      // 이미지 정보 조회
      setImageUrl(null);
      setHighlightImageUrl(null);

      if (selected.imageId) {
          const body = new FormData();
          body.append("fileId", selected.imageId);
          fetch("/admin/api/bxmember/member/kakao/file-info", { method: "POST", body })
            .then(res => res.json())
            .then(res => {
                if (res.success) setImageUrl(res.fileInfo.url);
            })
            .catch(err => console.error("Failed to fetch image", err));
      }

      if (selected.highlight?.imageId) {
          const body = new FormData();
          body.append("fileId", selected.highlight.imageId);
          fetch("/admin/api/bxmember/member/kakao/file-info", { method: "POST", body })
            .then(res => res.json())
            .then(res => {
                if (res.success) setHighlightImageUrl(res.fileInfo.url);
            })
            .catch(err => console.error("Failed to fetch highlight image", err));
      }
    } else {
      setTemplate(null);
      setVariables({});
      setVariablesHidden({});
    }
  };

  // Notify parent
  useEffect(() => {
    onSelectionChange(template, variables, variablesExtra);
  }, [template, variables, variablesExtra, onSelectionChange]);

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <Label>알림톡 템플릿 선택</Label>
          <button 
            type="button" 
            onClick={fetchTemplates}
            disabled={loadingTemplates}
            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-blue-600 transition-colors bg-white border border-gray-200 px-2 py-0.5 rounded shadow-sm disabled:opacity-50"
          >
            <RotateCw className={`h-3 w-3 ${loadingTemplates ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>
        <select 
          className="w-full p-2 border rounded-md"
          value={selectedTemplateId}
          onChange={(e) => handleTemplateSelect(e.target.value)}
          disabled={loadingTemplates}
        >
          <option value="">템플릿을 선택하세요</option>
          {templates.map(t => (
            <option key={t.templateId} value={t.templateId}>{t.name} ({t.templateId})</option>
          ))}
        </select>
        {loadingTemplates && <p className="text-xs text-blue-600 font-medium tracking-tight">템플릿 목록 동기화 중...</p>}
      </div>

      {template && (
        <div className="space-y-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100 transition-opacity">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs text-blue-700 font-semibold">템플릿 내용</Label>
              <div className="flex gap-1">
                {[
                  { id: 'preview', label: '미리보기' },
                  { id: 'original', label: '원본' },
                  { id: 'failover', label: '실패시 문자' }
                ].map(mode => (
                  <button 
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as ViewMode)}
                    className={`text-[10px] px-2 py-0.5 rounded transition-colors shadow-sm border ${
                      viewMode === mode.id 
                      ? "bg-blue-600 text-white border-blue-600 font-medium" 
                      : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                    }`}
                    type="button"
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="transition-all duration-200">
                {viewMode === 'preview' && (
                  <AlimtalkPreviewView 
                    template={template} 
                    variables={variables} 
                    variablesHidden={variablesHidden}
                    imageUrl={imageUrl}
                    highlightImageUrl={highlightImageUrl}
                  />
                )}
                {viewMode === 'original' && (
                  <AlimtalkOriginalView 
                    template={template} 
                    imageUrl={imageUrl}
                    highlightImageUrl={highlightImageUrl}
                  />
                )}
                {viewMode === 'failover' && (
                  <AlimtalkFailoverView 
                    template={template} 
                    variables={variables} 
                    variablesHidden={variablesHidden}
                    variablesExtra={variablesExtra}
                  />
                )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs text-blue-700 font-semibold">선택형 말머리 (Failover 시 반영)</Label>
              <button 
                type="button"
                onClick={saveFailoverConfig}
                disabled={savingConfig}
                className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {savingConfig ? "저장 중..." : "저장"}
              </button>
            </div>
            <textarea 
              className="w-full p-2 border rounded-md text-xs min-h-[60px] bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="저장된 선택적 prefix 말머리 (영구 저장용)"
              value={variablesExtra.persistentPrefix}
              onChange={(e) => setVariablesExtra(prev => ({ ...prev, persistentPrefix: e.target.value }))}
            />
            <textarea 
              className="w-full p-2 border rounded-md text-xs min-h-[60px] bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="저장안되는 선택적 말머리 (일회성)"
              value={variablesExtra.selectivePrefix}
              onChange={(e) => setVariablesExtra(prev => ({ ...prev, selectivePrefix: e.target.value }))}
            />
          </div>

          {Object.keys(variables).length > 0 && (
            <div className="space-y-3">
              <Label className="text-xs text-blue-700 font-semibold">변수 입력</Label>
              <div className="grid grid-cols-1 gap-3">
                {Object.keys(variables).map(v => (
                  <div key={v} className="space-y-1">
                    <div className="flex justify-between items-center">
                        <Label className="text-[10px] text-gray-500 font-medium">{v}</Label>
                        <button 
                            type="button"
                            onClick={() => {
                                const isHidden = !variablesHidden[v];
                                const nextHidden = { ...variablesHidden, [v]: isHidden };
                                const nextVars = { ...variables };
                                if (isHidden) nextVars[v] = ""; 
                                
                                setVariablesHidden(nextHidden);
                                setVariables(nextVars);
                            }}
                            className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                                variablesHidden[v] 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-400 border-gray-200 hover:border-blue-300 hover:text-blue-500'
                            }`}
                        >
                            문구 없음
                        </button>
                    </div>
                    <Input 
                      placeholder={variablesHidden[v] ? "숨김 상태" : `${v}에 들어갈 문구`}
                      value={variables[v]}
                      onChange={(e) => {
                          setVariables(prev => ({ ...prev, [v]: e.target.value }));
                      }}
                      disabled={variablesHidden[v]}
                      className={variablesHidden[v] ? "bg-gray-50/50 text-gray-400 italic" : ""}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
