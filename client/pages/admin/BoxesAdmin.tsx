import { useSiteConfig } from "@/state/site-config";
import { useEffect, useMemo, useState } from "react";
import {
  GripVertical,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  RotateCcw,
} from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  AdminPageHeader,
  AdminCard,
  AdminSection,
  AdminButton,
  AdminIconButton,
} from "@/components/admin/AdminUI";
import { WidthProvider, Responsive } from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

function expandShortHex(hex?: string): string | undefined {
  if (!hex) return hex;
  const m = hex.trim().match(/^#([0-9a-fA-F]{3})$/);
  if (m) {
    const [r, g, b] = m[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return hex;
}

export default function BoxesAdmin() {
  const { state, set } = useSiteConfig();
  const [drafts, setDrafts] = useState(() => state.boxes.map((b) => ({ ...b })));

  useEffect(() => {
    setDrafts(state.boxes.map((b) => ({ ...b })));
  }, [state.boxes.length]);

  const setDraft = (id: string, patch: any) =>
    setDrafts((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const add = () => {
    const nb = {
      id: crypto.randomUUID(),
      title: "New Box",
      type: "image" as const,
      size: "small" as const,
      height: 200,
      background: { kind: "color", color: "#f3f4f6" } as any,
      buttonLabel: "Read More",
      ctaMode: "button" as const,
      modalEnabled: true,
      borderRadius: 12,
      shadow: { intensity: 12, direction: "bottom-right" as const },
      modalStyle: {
        bg: "#111111",
        text: "#ffffff",
        shadow: "0 10px 30px rgba(0,0,0,0.3)",
        radius: 16,
      },
    };
    set({ boxes: [...state.boxes, nb] });
  };

  const duplicate = (id: string) => {
    const src = state.boxes.find((b) => b.id === id);
    if (!src) return;
    const copy = { ...src, id: crypto.randomUUID(), title: src.title + " (copy)" };
    set({ boxes: [...state.boxes, copy] });
  };

  const resetBox = (id: string) => {
    const base = {
      title: "New Box",
      type: "image" as const,
      size: "small" as const,
      height: 200,
      background: { kind: "color", color: "#f3f4f6" } as any,
      buttonLabel: "Read More",
      ctaMode: "button" as const,
      modalEnabled: true,
      borderRadius: 12,
      shadow: { intensity: 12, direction: "bottom-right" as const },
      modalStyle: {
        bg: "#111111",
        text: "#ffffff",
        shadow: "0 10px 30px rgba(0,0,0,0.3)",
        radius: 16,
      },
    };
    set({
      boxes: state.boxes.map((b) => (b.id === id ? { ...base, id } : b)),
    });
  };

  const remove = (id: string) => set({ boxes: state.boxes.filter((b) => b.id !== id) });
  const toggle = (id: string) =>
    set({ boxes: state.boxes.map((b) => (b.id === id ? { ...b, hidden: !b.hidden } : b)) });

  const apply = (id: string) => {
    const draft = drafts.find((d) => d.id === id);
    if (!draft) return;
    set({ boxes: state.boxes.map((b) => (b.id === id ? draft : b)) });
  };

  const applyAll = () => {
    const byId = Object.fromEntries(drafts.map((d) => [d.id, d] as const));
    set({ boxes: state.boxes.map((b) => byId[b.id] || b) });
  };

  const cols = { lg: 12, md: 8, sm: 4 } as const;
  const breakpoints = { lg: 1200, md: 996, sm: 0 } as const;
  const defaultSize = (size?: string) => (size === "large" ? 12 : size === "medium" ? 6 : 3);

  const layouts = {
    lg: state.boxes.map((b, i) => ({
      i: b.id,
      x: b.layout?.desktop?.x ?? ((i * 3) % 12),
      y: b.layout?.desktop?.y ?? Math.floor((i * 3) / 12) * 2,
      w: b.layout?.desktop?.w ?? defaultSize(b.size),
      h: b.layout?.desktop?.h ?? 6,
    })),
    md: state.boxes.map((b, i) => ({
      i: b.id,
      x: b.layout?.tablet?.x ?? ((i * 4) % 8),
      y: b.layout?.tablet?.y ?? Math.floor((i * 4) / 8) * 2,
      w: b.layout?.tablet?.w ?? Math.min(defaultSize(b.size), 8),
      h: b.layout?.tablet?.h ?? 6,
    })),
    sm: state.boxes.map((b, i) => ({
      i: b.id,
      x: b.layout?.mobile?.x ?? 0,
      y: b.layout?.mobile?.y ?? i * 6,
      w: b.layout?.mobile?.w ?? 4,
      h: b.layout?.mobile?.h ?? 6,
    })),
  } as const;

  const handleLayoutChange = (_current: any, nextLayouts: any) => {
    const byId = (list: any[]) => Object.fromEntries(list.map((l) => [l.i, l] as const));
    const lg = byId(nextLayouts.lg || []);
    const md = byId(nextLayouts.md || []);
    const sm = byId(nextLayouts.sm || []);
    set({
      boxes: state.boxes.map((b) => ({
        ...b,
        layout: {
          desktop: lg[b.id]
            ? { x: lg[b.id].x, y: lg[b.id].y, w: lg[b.id].w, h: lg[b.id].h }
            : b.layout?.desktop,
          tablet: md[b.id]
            ? { x: md[b.id].x, y: md[b.id].y, w: md[b.id].w, h: md[b.id].h }
            : b.layout?.tablet,
          mobile: sm[b.id]
            ? { x: sm[b.id].x, y: sm[b.id].y, w: sm[b.id].w, h: sm[b.id].h }
            : b.layout?.mobile,
        },
      })),
    });
  };

  const items = useMemo(
    () => state.boxes.map((b) => ({ live: b, draft: drafts.find((d) => d.id === b.id) || b })),
    [state.boxes, drafts],
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Content Boxes"
        description="Drag, resize, and configure content boxes. Changes sync instantly across the site (localStorage)."
        action={
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              {state.boxes.filter((b) => !b.hidden).length} visible / {state.boxes.length} total
            </div>
            <AdminButton onClick={add}>
              <Plus className="h-4 w-4 mr-2" /> Add Box
            </AdminButton>
            <AdminButton variant="secondary" onClick={applyAll}>Apply All Changes</AdminButton>
          </div>
        }
      />

      <AdminSection title="Layout Designer" description="Drag to move, resize from corners. Responsive layouts for desktop/tablet/mobile are stored.">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts as any}
          breakpoints={breakpoints as any}
          cols={cols as any}
          isResizable
          isDraggable
          margin={[16, 16]}
          rowHeight={20}
          containerPadding={[0, 0]}
          measureBeforeMount
          useCSSTransforms
          compactType={null}
          preventCollision
          onLayoutChange={handleLayoutChange}
        >
          {state.boxes.map((b) => (
            <div key={b.id} className="border rounded-lg bg-white shadow-sm overflow-hidden">
              <div className="p-3 flex items-center justify-between">
                <div className="truncate font-medium text-sm">{b.title}</div>
                <div className="flex items-center gap-1">
                  <AdminIconButton title="Duplicate" onClick={() => duplicate(b.id)}>
                    <Copy className="h-4 w-4" />
                  </AdminIconButton>
                  <AdminIconButton title={b.hidden ? "Show" : "Hide"} onClick={() => toggle(b.id)}>
                    {b.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </AdminIconButton>
                  <AdminIconButton title="Reset" onClick={() => resetBox(b.id)}>
                    <RotateCcw className="h-4 w-4" />
                  </AdminIconButton>
                  <AdminIconButton variant="danger" title="Delete" onClick={() => remove(b.id)}>
                    <Trash2 className="h-4 w-4" />
                  </AdminIconButton>
                </div>
              </div>
              {b.imageUrl && (
                <img src={b.imageUrl} alt="preview" className="w-full h-24 object-cover" />
              )}
            </div>
          ))}
        </ResponsiveGridLayout>
      </AdminSection>

      <div className="space-y-6">
        {items.map(({ live, draft }, i) => (
          <AdminCard key={live.id} className="relative">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded bg-neutral-100">
                <GripVertical className="h-4 w-4 text-neutral-600" />
              </span>
              <input
                value={draft.title}
                onChange={(e) => setDraft(live.id, { title: e.target.value })}
                className="border rounded px-2 py-1 text-sm flex-1"
              />
              <input
                type="number"
                min={120}
                max={600}
                value={draft.height || 200}
                onChange={(e) => setDraft(live.id, { height: Number(e.target.value) })}
                className="w-24 border rounded px-2 py-1 text-sm"
              />
              <AdminIconButton variant="secondary" size="small" onClick={() => toggle(live.id)} title={live.hidden ? "Show box" : "Hide box"}>
                {live.hidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </AdminIconButton>
              <AdminIconButton variant="ghost" size="small" onClick={() => duplicate(live.id)} title="Duplicate">
                <Copy className="h-3 w-3" />
              </AdminIconButton>
              <AdminIconButton variant="danger" size="small" onClick={() => remove(live.id)} title="Delete box">
                <Trash2 className="h-3 w-3" />
              </AdminIconButton>
            </div>

            <div className="mt-3 grid lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {draft.imageUrl && (
                    <img src={draft.imageUrl} alt="preview" className="h-14 w-24 object-cover rounded" />
                  )}
                  <label className="text-xs px-2 py-1 rounded bg-neutral-800 text-white cursor-pointer">
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const url = await new Promise<string>((res, rej) => {
                          const r = new FileReader();
                          r.onload = () => res(r.result as string);
                          r.onerror = rej;
                          r.readAsDataURL(f);
                        });
                        setDraft(live.id, { imageUrl: url, type: "image" });
                      }}
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">CTA Mode</label>
                  <select
                    value={draft.ctaMode || "button"}
                    onChange={(e) => setDraft(live.id, { ctaMode: e.target.value as any })}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="button">Button only</option>
                    <option value="icon">Icon only</option>
                    <option value="both">Button + Icon</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Button Label</label>
                  <input
                    value={draft.buttonLabel || "Read More"}
                    onChange={(e) => setDraft(live.id, { buttonLabel: e.target.value })}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                  <label className="text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={draft.modalEnabled !== false}
                      onChange={(e) => setDraft(live.id, { modalEnabled: e.target.checked })}
                    /> Enable Modal
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Border Radius</label>
                  <input
                    type="range"
                    min={0}
                    max={28}
                    value={draft.borderRadius ?? 12}
                    onChange={(e) => setDraft(live.id, { borderRadius: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Shadow</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={draft.shadow?.direction || "bottom-right"}
                      onChange={(e) => setDraft(live.id, { shadow: { ...(draft.shadow || { intensity: 12 }), direction: e.target.value as any } })}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                    </select>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      value={draft.shadow?.intensity ?? 12}
                      onChange={(e) => setDraft(live.id, { shadow: { ...(draft.shadow || { direction: "bottom-right" }), intensity: Number(e.target.value) } })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Background</label>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={draft.background?.kind || "color"}
                      onChange={(e) =>
                        setDraft(live.id, {
                          background:
                            e.target.value === "color"
                              ? { kind: "color", color: "#f3f4f6" }
                              : e.target.value === "gradient"
                                ? { kind: "gradient", from: "#ffffff", to: "#f3f4f6", direction: "to bottom" }
                                : ({ kind: "image", url: (draft.background && (draft.background as any).url) || "", scale: 100, opacity: 1, overlay: "none", overlayStrength: 0.4 } as any),
                        })
                      }
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="color">Color</option>
                      <option value="gradient">Gradient</option>
                      <option value="image">Image</option>
                    </select>
                    {draft.background?.kind === "color" && (
                      <input
                        type="color"
                        value={(draft.background as any).color || "#f3f4f6"}
                        onChange={(e) =>
                          setDraft(live.id, {
                            background: { kind: "color", color: expandShortHex(e.target.value) || e.target.value } as any,
                          })
                        }
                      />
                    )}
                    {draft.background?.kind === "gradient" && (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(draft.background as any).from || "#ffffff"}
                          onChange={(e) =>
                            setDraft(live.id, { background: { ...(draft.background as any), from: expandShortHex(e.target.value) || e.target.value } as any })
                          }
                        />
                        <input
                          type="color"
                          value={(draft.background as any).to || "#f3f4f6"}
                          onChange={(e) =>
                            setDraft(live.id, { background: { ...(draft.background as any), to: expandShortHex(e.target.value) || e.target.value } as any })
                          }
                        />
                        <select
                          value={(draft.background as any).direction || "to bottom"}
                          onChange={(e) =>
                            setDraft(live.id, { background: { ...(draft.background as any), direction: e.target.value } as any })
                          }
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="to top">to top</option>
                          <option value="to bottom">to bottom</option>
                          <option value="to left">to left</option>
                          <option value="to right">to right</option>
                          <option value="to top right">to top right</option>
                          <option value="to top left">to top left</option>
                          <option value="to bottom right">to bottom right</option>
                          <option value="to bottom left">to bottom left</option>
                        </select>
                      </div>
                    )}
                    {draft.background?.kind === "image" && (
                      <div className="space-y-2 w-full">
                        {(draft.background as any).url && (
                          <img src={(draft.background as any).url} alt="bg" className="h-14 w-24 object-cover rounded" />
                        )}
                        <label className="text-xs px-2 py-1 rounded bg-neutral-800 text-white cursor-pointer inline-block">
                          Upload Background
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const url = await new Promise<string>((res, rej) => {
                                const r = new FileReader();
                                r.onload = () => res(r.result as string);
                                r.onerror = rej;
                                r.readAsDataURL(f);
                              });
                              const bg = draft.background as any;
                              setDraft(live.id, {
                                background: { kind: "image", url, scale: bg?.scale || 100, opacity: bg?.opacity ?? 1, overlay: bg?.overlay || "none", overlayStrength: bg?.overlayStrength ?? 0.4 } as any,
                              });
                            }}
                          />
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-16">Scale</span>
                          <input
                            type="range"
                            min={50}
                            max={200}
                            value={(draft.background as any).scale || 100}
                            onChange={(e) => setDraft(live.id, { background: { ...(draft.background as any), scale: Number(e.target.value) } as any })}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-16">Opacity</span>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={(draft.background as any).opacity ?? 1}
                            onChange={(e) => setDraft(live.id, { background: { ...(draft.background as any), opacity: Number(e.target.value) } as any })}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-16">Adjust</span>
                          <select
                            value={(draft.background as any).overlay || "none"}
                            onChange={(e) => setDraft(live.id, { background: { ...(draft.background as any), overlay: e.target.value as any } as any })}
                            className="border rounded px-2 py-1 text-sm"
                          >
                            <option value="none">None</option>
                            <option value="darken">Darken</option>
                            <option value="lighten">Lighten</option>
                          </select>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={(draft.background as any).overlayStrength ?? 0.4}
                            onChange={(e) => setDraft(live.id, { background: { ...(draft.background as any), overlayStrength: Number(e.target.value) } as any })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm">Modal Styles</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">BG</span>
                    <input
                      type="color"
                      value={expandShortHex(draft.modalStyle?.bg) || "#111111"}
                      onChange={(e) => setDraft(live.id, { modalStyle: { ...draft.modalStyle, bg: expandShortHex(e.target.value) } })}
                    />
                    <span className="text-xs">Text</span>
                    <input
                      type="color"
                      value={expandShortHex(draft.modalStyle?.text) || "#ffffff"}
                      onChange={(e) => setDraft(live.id, { modalStyle: { ...draft.modalStyle, text: expandShortHex(e.target.value) } })}
                    />
                    <span className="text-xs">Radius</span>
                    <input
                      type="range"
                      min={0}
                      max={28}
                      value={draft.modalStyle?.radius || 16}
                      onChange={(e) => setDraft(live.id, { modalStyle: { ...draft.modalStyle, radius: Number(e.target.value) } })}
                    />
                  </div>
                  <input
                    value={draft.modalStyle?.shadow || "0 10px 30px rgba(0,0,0,0.3)"}
                    onChange={(e) => setDraft(live.id, { modalStyle: { ...draft.modalStyle, shadow: e.target.value } })}
                    className="w-full border rounded px-2 py-1 text-xs"
                    placeholder="CSS box-shadow"
                  />
                </div>

                <label className="block text-sm">Description</label>
                <RichTextEditor
                  value={draft.description || ""}
                  onChange={(html) => setDraft(live.id, { description: html })}
                />

                <div className="flex items-center justify-end gap-2">
                  <AdminButton onClick={() => resetBox(live.id)} variant="secondary">Reset</AdminButton>
                  <AdminButton onClick={() => apply(live.id)} variant="primary">Apply Changes</AdminButton>
                </div>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>
      <div className="text-sm text-neutral-600 mt-3">Drag and resize in the layout designer above. Text and style changes require Apply.</div>
    </div>
  );
}
