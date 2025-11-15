import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../lib/api";

import { useTranslation } from "react-i18next";

import "../styles/Login.css";

function Product() {
  const { t } = useTranslation();
  const { state } = useLocation();
  const { group_id, group_name } = state || {};

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [openFaq, setOpenFaq] = useState(null);

  const voucherFaqItems = [
    { id: 1, qKey: "faq_voucher.0.question", aKey: "faq_voucher.0.answer" },
    { id: 2, qKey: "faq_voucher.1.question", aKey: "faq_voucher.1.answer" },
    { id: 3, qKey: "faq_voucher.2.question", aKey: "faq_voucher.2.answer" },
    { id: 4, qKey: "faq_voucher.3.question", aKey: "faq_voucher.3.answer" },
    { id: 5, qKey: "faq_voucher.4.question", aKey: "faq_voucher.4.answer" },
    { id: 6, qKey: "faq_voucher.5.question", aKey: "faq_voucher.5.answer" },
    { id: 7, qKey: "faq_voucher.6.question", aKey: "faq_voucher.6.answer" },
    { id: 8, qKey: "faq_voucher.7.question", aKey: "faq_voucher.7.answer" },
  ];

  // --- modes & tab ---
  const [activeTab, setActiveTab] = useState(null); // "voucher" | "topup"

  // voucher mode
  const [region, setRegion] = useState("");
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // topup mode
  const [topupRegion, setTopupRegion] = useState("");
  const [activeTopup, setActiveTopup] = useState(null);
  const [selectedTopup, setSelectedTopup] = useState(null);
  const [topupTextValues, setTopupTextValues] = useState({}); // text fields like account/ID

  // shared / purchase
  const [userEmail, setUserEmail] = useState("");

  // confirmation + modal
  const [confirmed, setConfirmed] = useState(false);
  const [pay, setPay] = useState(false);
  const [modalConfirmed, setModalConfirmed] = useState(false);

  // alerts like Login/Steam
  const [appAlert, setAppAlert] = useState({ type: null, message: "" });
  const closeAlert = () => setAppAlert({ type: null, message: "" });

  // while sending request
  const [paying, setPaying] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    voucherRegion: false,
    voucherEmail: false,
    topupRegion: false,
    topupProduct: false,
    topupTexts: {}, // { [fieldName]: boolean }
  });

  const isValidEmail = (value) => {
    const v = String(value || "").trim();
    if (!v) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  };

  useEffect(() => {
    if (!group_id && !group_name) return;
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get("/v1/partner/catalog/product/group/form", {
          params: { group: group_id || group_name },
        });
        if (!cancel) setItem(data || null);
      } catch (e) {
        if (!cancel) setError(e?.response?.data?.message || "Ошибка загрузки продуктов");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [group_id, group_name]);

  // pick out fields
  const voucherFields = item?.forms?.voucher_fields || null;
  const topupFields = item?.forms?.topup_fields || null;

  // init active tab based on availability
  useEffect(() => {
    if (!item) return;
    const hasVoucher = Array.isArray(voucherFields) && voucherFields.length > 0;
    const hasTopup = Array.isArray(topupFields) && topupFields.length > 0;

    if (hasVoucher && hasTopup) setActiveTab((t) => t || "voucher"); // default voucher if both
    else if (hasVoucher) setActiveTab("voucher");
    else if (hasTopup) setActiveTab("topup");
    else setActiveTab(null);
  }, [item]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Voucher helpers ---
  const regionOptions = useMemo(() => {
    const field = (voucherFields || []).find(f => f?.name === "region" && f?.type === "options");
    return Array.isArray(field?.options) ? field.options : [];
  }, [voucherFields]);

  const voucherProducts = useMemo(() => {
    const field = (voucherFields || []).find(f => f?.name === "product_id" && f?.type === "options");
    return Array.isArray(field?.options) ? field.options : [];
  }, [voucherFields]);

  const selectedRegionName = useMemo(
    () => regionOptions.find(r => r.value === region)?.name || "",
    [region, regionOptions]
  );

  const filteredVouchers = useMemo(() => {
    if (!selectedRegionName) return [];
    return voucherProducts.filter(p => {
      const pr = (p.region || "").toLowerCase();
      return pr === selectedRegionName.toLowerCase() || pr === region.toLowerCase();
    });
  }, [voucherProducts, selectedRegionName, region]);

  useEffect(() => {
    if (activeTab !== "voucher") return;
    if (regionOptions.length && !region) setRegion(regionOptions[0].value);
  }, [activeTab, regionOptions, region]);

  useEffect(() => {
    setActiveVoucher(null);
    setSelectedVoucher(null);
  }, [region]);

  const emailField = useMemo(() => {
    const vf = voucherFields || [];
    return vf.find(f => f.name === "email");
  }, [voucherFields]);

  // --- Topup helpers ---
  const topupRegionOptions = useMemo(() => {
    const field = (topupFields || []).find(f => f?.name === "region" && f?.type === "options");
    return Array.isArray(field?.options) ? field.options : [];
  }, [topupFields]);

  const topupEmailField = useMemo(() => {
    const tf = topupFields || [];
    return tf.find(f => f.name === "email" && f.type === "text");
  }, [topupFields]);

  const topupEmail = topupEmailField
    ? String(topupTextValues[topupEmailField.name] || "")
    : "";

  const topupProducts = useMemo(() => {
    const field = (topupFields || []).find(f => f?.name === "product_id" && f?.type === "options");
    return Array.isArray(field?.options) ? field.options : [];
  }, [topupFields]);

  const topupSelectedRegionName = useMemo(
    () => topupRegionOptions.find(r => r.value === topupRegion)?.name || "",
    [topupRegion, topupRegionOptions]
  );

  const filteredTopupProducts = useMemo(() => {
    if (!topupSelectedRegionName) return topupProducts;
    return topupProducts.filter(p => {
      const pr = (p.region || "").toLowerCase();
      return pr === "любой" || pr === topupSelectedRegionName.toLowerCase() || pr === topupRegion.toLowerCase();
    });
  }, [topupProducts, topupSelectedRegionName, topupRegion]);

  useEffect(() => {
    if (activeTab !== "topup") return;
    if (topupRegionOptions.length && !topupRegion) setTopupRegion(topupRegionOptions[0].value);
  }, [activeTab, topupRegionOptions, topupRegion]);

  useEffect(() => {
    setActiveTopup(null);
    setSelectedTopup(null);
  }, [topupRegion]);

  // modal open/close
  const togglePay = () => {
    setPay(prev => {
      const next = !prev;
      if (next) setModalConfirmed(false);
      return next;
    });
  };

  // derived for summary per active tab
  const chosenProduct = activeTab === "voucher" ? selectedVoucher : selectedTopup;
  const chosenPrice = chosenProduct?.price;
  const chosenLabel = chosenProduct?.product;

  const regionToShow =
    activeTab === "voucher"
      ? (selectedRegionName || "—")
      : (topupSelectedRegionName || "—");

  // validation per tab
  const canPayVoucher =
    !!(activeTab === "voucher") &&
    !!selectedVoucher &&
    !!region &&
    (!emailField || isValidEmail(userEmail)) &&
    confirmed;

  const topupTextRequiredOK = useMemo(() => {
    // Assume all 'text' fields are required unless backend says otherwise.
    const texts = (topupFields || []).filter(f => f.type === "text");
    return texts.every(f => String(topupTextValues[f.name] || "").trim() !== "");
  }, [topupFields, topupTextValues]);

  const canPayTopup =
    !!(activeTab === "topup") &&
    !!topupRegion &&
    !!selectedTopup &&
    topupTextRequiredOK &&
    (!topupEmailField || isValidEmail(topupEmail)) &&
    confirmed;

  const canPay = activeTab === "voucher" ? canPayVoucher : canPayTopup;

  const hasVoucher = Array.isArray(voucherFields) && voucherFields.length > 0;
  const hasTopup = Array.isArray(topupFields) && topupFields.length > 0;

  // close modal when alert appears, and auto-hide after 5s
  // close modal only on success, auto-hide alert after 5s
  useEffect(() => {
    if (appAlert.type) {
      if (appAlert.type === "green") {
        setPay(false); // close only on success, keep open on error
      }
      const t = setTimeout(() => setAppAlert({ type: null, message: "" }), 5000);
      return () => clearTimeout(t);
    }
  }, [appAlert]);

  async function handleBuyVoucher() {
    if (activeTab !== "voucher") return;

    // basic guard: must have product and email (if the field exists)
    if (!selectedVoucher) {
      setAppAlert({ type: "red", message: "Выберите номинал ваучера" });
      return;
    }
    if (emailField && !isValidEmail(userEmail)) {
      setAppAlert({ type: "red", message: "Введите корректный email" });
      return;
    }

    const payload = {
      product_id: selectedVoucher.value, // <-- voucher option "value" is product_id
      email: String(userEmail).trim(),
    };

    setPaying(true);
    try {
      const { data } = await api.post("/v1/products/voucher/buy", payload);

      if (data?.status && data?.voucher) {
        // 1) update balance immediately
        const dec = Number(selectedVoucher.price) || 0;
        if (dec > 0) {
          window.dispatchEvent(new CustomEvent("balance:decrement", { detail: { amount: dec } }));
        }

        // 2) open backend voucher link in a new tab
        window.open(data.voucher, "_blank", "noopener,noreferrer");

        // 3) reset form + close modal
        setActiveVoucher(null);
        setSelectedVoucher(null);
        setUserEmail("");
        setConfirmed(false);
        setModalConfirmed(false);
        setPay(false);

        // 4) success alert with backend message
        const successMsg = data?.comment || data?.message || `${t("product.successVoucher")}`;
        setAppAlert({ type: "green", message: successMsg });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // backend returned explicit failure
      const errMsg = data?.comment || data?.message || "Не удалось купить ваучер";
      setAppAlert({ type: "red", message: errMsg });
    } catch (e) {
      const errMsg = e?.response?.data?.comment || e?.response?.data?.message || `${t("product.errorVoucherBuy")}`;
      setAppAlert({ type: "red", message: errMsg });
    } finally {
      setPaying(false);
    }
  }

  async function handleBuyTopup() {
    if (activeTab !== "topup") return;

    // Build payload from backend "name" attributes
    const payload = {};

    // 1) iterate topup_fields and fill by name
    (topupFields || []).forEach((f) => {
      if (f.type === "options" && f.name === "region") {
        payload[f.name] = topupRegion || "";
      } else if (f.type === "options" && f.name === "product_id") {
        payload[f.name] = selectedTopup?.value ?? null; // option.value -> product_id
      } else if (f.type === "text") {
        // any text field: account, email, nickname, etc.
        payload[f.name] = String(topupTextValues[f.name] || "").trim();
      }
    });

    if (!payload.product_id) {
      setAppAlert({ type: "red", message: "Выберите товар" });
      return;
    }

    if (topupEmailField && !isValidEmail(topupEmail)) {
      setAppAlert({ type: "red", message: "Введите корректный email" });
      return;
    }

    setPaying(true);

    setPaying(true);
    try {
      const { data } = await api.post("/v1/products/topup/buy", payload);

      if (data?.status && data?.voucher) {
        // 1) decrease balance immediately by selectedTopup.price
        const dec = Number(selectedTopup?.price) || 0;
        if (dec > 0) {
          window.dispatchEvent(new CustomEvent("balance:decrement", { detail: { amount: dec } }));
        }

        // 2) open backend link in new tab (same as Steam/Voucher)
        window.open(data.voucher, "_blank", "noopener,noreferrer");

        // 3) reset all TOPUP fields + close modal
        setTopupRegion(topupRegionOptions[0]?.value || "");
        setActiveTopup(null);
        setSelectedTopup(null);
        setTopupTextValues({});
        setConfirmed(false);
        setModalConfirmed(false);
        setPay(false);

        // 4) success alert with backend message
        const successMsg = data?.comment || data?.message || `${t("product.successTopup")}`;
        setAppAlert({ type: "green", message: successMsg });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // explicit backend failure
      const errMsg = data?.comment || data?.message || "Не удалось оформить пополнение";
      setAppAlert({ type: "red", message: errMsg });
    } catch (e) {
      const errMsg = e?.response?.data?.comment || e?.response?.data?.message || `${t("product.errorTopupBuy")}`;
      setAppAlert({ type: "red", message: errMsg });
    } finally {
      setPaying(false);
    }
  }

  // закрывать открытый вопрос при смене таба
  useEffect(() => {
    setOpenFaq(null);
  }, [activeTab]);

  if (loading) return <div>Загрузка…</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="Home">
      <form className="steam-grid">
        <div>
          {item ? (
            <div>
              <div className="steam-block">
                <div className="s-block-f">
                  <img
                    src={item.icon || "/steamsmall.png"}
                    alt={item.group || "product"}
                    onError={(e) => (e.currentTarget.src = "/steamsmall.png")}
                  />
                  <div>
                    <p className="s-block-h">{t("product.topupBalance")} {item.group}</p>
                    <span className="s-d">{item.short_info}</span>

                    {/* Switcher: render only buttons that exist */}
                    <div className="s-block-btns" style={{ marginTop: 8 }}>
                      {hasTopup && (
                        <button
                          type="button"
                          className={activeTab === "topup" ? "active" : ""}
                          onClick={() => setActiveTab("topup")}
                        >
                          {t("product.tabTopup")}
                        </button>
                      )}
                      {hasVoucher && (
                        <div className="v-tool">
                          <button
                            type="button"
                            className={activeTab === "voucher" ? "active" : ""}
                            onClick={() => setActiveTab("voucher")}
                          >
                            {t("product.tabVoucher")}
                            <div className="icon-wrap">
                              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="28" height="28" rx="10" fill="#F5F5F9" />
                                <rect x="0.5" y="0.5" width="27" height="27" rx="9.5" stroke="black" stroke-opacity="0.15" />
                                <path d="M14.0026 20.6663C15.8435 20.6663 17.5102 19.9201 18.7166 18.7137C19.9231 17.5073 20.6693 15.8406 20.6693 13.9997C20.6693 12.1587 19.9231 10.4921 18.7166 9.28563C17.5102 8.0792 15.8435 7.33301 14.0026 7.33301C12.1617 7.33301 10.495 8.0792 9.28856 9.28563C8.08213 10.4921 7.33594 12.1587 7.33594 13.9997C7.33594 15.8406 8.08213 17.5073 9.28856 18.7137C10.495 19.9201 12.1617 20.6663 14.0026 20.6663Z" stroke="black" stroke-opacity="0.8" stroke-width="1.3" stroke-linejoin="round" />
                                <path d="M14 15.5413V14.208C15.1046 14.208 16 13.3126 16 12.208C16 11.1034 15.1046 10.208 14 10.208C12.8954 10.208 12 11.1034 12 12.208" stroke="black" stroke-opacity="0.8" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M13.9974 18.5417C14.4576 18.5417 14.8307 18.1686 14.8307 17.7083C14.8307 17.2481 14.4576 16.875 13.9974 16.875C13.5372 16.875 13.1641 17.2481 13.1641 17.7083C13.1641 18.1686 13.5372 18.5417 13.9974 18.5417Z" fill="black" fill-opacity="0.8" />
                                <path d="M13.9971 17.125C14.3191 17.125 14.5809 17.386 14.5811 17.708C14.5811 18.0302 14.3192 18.292 13.9971 18.292C13.6751 18.2918 13.4141 18.0301 13.4141 17.708C13.4142 17.3861 13.6752 17.1252 13.9971 17.125Z" stroke="black" stroke-opacity="0.8" stroke-width="0.5" />
                              </svg>
                              <span>{t("product.voucherTooltip")}</span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ========== VOUCHER TAB ONLY ========== */}
              {activeTab === "voucher" && hasVoucher && (
                <>
                  <div className="steam-block" style={{ marginTop: 16 }}>
                    <p className="s-block-h">{t("product.selectRegion")}</p>
                    <div style={{ position: "relative", marginTop: 16 }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                        xmlns="http://www.w3.org/2000/svg" className="slct-arr">
                        <path d="M3.33854 6.66699L10.0052 13.3337L16.6719 6.66699"
                          stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>

                      <select
                        value={region}
                        onChange={(e) => {
                          setRegion(e.target.value);
                          setActiveVoucher(null);
                          setSelectedVoucher(null);
                          setFieldErrors(prev => ({ ...prev, voucherRegion: false }));
                        }}
                        disabled={!regionOptions.length}
                        style={fieldErrors.voucherRegion ? { border: "1px solid #F50100" } : {}}
                      >
                        {regionOptions.length ? (
                          regionOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.name}
                            </option>
                          ))
                        ) : (
                          <option>Регионы недоступны</option>
                        )}
                      </select>
                    </div>

                    {selectedRegionName && filteredVouchers.length > 0 && (
                      <div style={{ marginTop: 20 }}>
                        <b>{t("product.selectNominal")}</b>
                        <div className="voucher-options">
                          {filteredVouchers.map((p) => (
                            <button
                              key={p.value}
                              type="button"
                              className={`voucher-btn ${activeVoucher === p.value ? "active" : ""}`}
                              onClick={() => {
                                setActiveVoucher(p.value);
                                setSelectedVoucher(p);
                              }}
                              title={`${p.product} — ${p.price} ТМТ`}
                            >
                              {p.product}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="steam-block" style={{ marginTop: 16 }}>
                    <p className="s-block-h">{t("product.purchase")}</p>

                    {/* Email field lives only in voucher flow */}
                    {emailField && (
                      <div style={{ marginTop: 16 }}>
                        <span style={{ marginBottom: 16, fontSize: 14, display: "flex" }}>
                          {emailField.label}
                        </span>
                        <input
                          type={emailField.type === "email" ? "email" : "text"}
                          id={emailField.name}
                          name={emailField.name}
                          placeholder={emailField.label}
                          value={userEmail}
                          onChange={(e) => {
                            setUserEmail(e.target.value);
                            setFieldErrors(prev => ({ ...prev, voucherEmail: false }));
                          }}
                          style={fieldErrors.voucherEmail ? { border: "1px solid #F50100" } : {}}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ========== TOPUP TAB ONLY ========== */}
              {activeTab === "topup" && hasTopup && (
                <div className="steam-block" style={{ marginTop: 16 }}>
                  <p className="s-block-h">{t("product.purchase")}</p>

                  <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
                    {topupFields.map((f) => {
                      // topup region (options)
                      if (f.type === "options" && f.name === "region") {
                        return (
                          <div key={f.name}>
                            <span style={{ marginBottom: 8, fontSize: 14, display: "flex" }}>
                              {f.label}
                            </span>
                            <div style={{ position: "relative" }}>
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                xmlns="http://www.w3.org/2000/svg" className="slct-arr">
                                <path d="M3.33854 6.66699L10.0052 13.3337L16.6719 6.66699"
                                  stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <select
                                value={topupRegion}
                                onChange={(e) => {
                                  setTopupRegion(e.target.value);
                                  setFieldErrors(prev => ({ ...prev, topupRegion: false }));
                                }}
                                disabled={!topupRegionOptions.length}
                                style={fieldErrors.topupRegion ? { border: "1px solid #F50100" } : {}}
                              >
                                {topupRegionOptions.length ? (
                                  topupRegionOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.name}
                                    </option>
                                  ))
                                ) : (
                                  <option>{t("product.regionsUnavailable")}</option>
                                )}
                              </select>
                            </div>
                          </div>
                        );
                      }

                      // topup product_id (options) -> buttons
                      if (f.type === "options" && f.name === "product_id") {
                        return (
                          <div key={f.name}>
                            <b>{f.label}</b>
                            <div className="voucher-options" style={{ marginTop: 8 }}>
                              {filteredTopupProducts.map((p) => (
                                <button
                                  key={p.value}
                                  type="button"
                                  className={`voucher-btn ${activeTopup === p.value ? "active" : ""}`}
                                  onClick={() => {
                                    setActiveTopup(p.value);
                                    setSelectedTopup(p);
                                    setFieldErrors(prev => ({ ...prev, topupProduct: false }));
                                  }}
                                  title={`${p.product} — ${p.price} ТМТ`}
                                >
                                  {p.product}
                                </button>
                              ))}
                              {filteredTopupProducts.length === 0 && (
                                <div style={{ opacity: 0.7 }}>{t("product.topupUnavailable")}</div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // any text fields (e.g., account/ID, etc.)
                      if (f.type === "text") {
                        const hasError = !!fieldErrors.topupTexts?.[f.name];

                        return (
                          <div key={f.name}>
                            <span style={{ marginBottom: 8, fontSize: 14, display: "flex" }}>
                              {f.label}
                            </span>
                            <input
                              type="text"
                              id={f.name}
                              name={f.name}
                              placeholder={f.label}
                              value={topupTextValues[f.name] || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                setTopupTextValues(prev => ({ ...prev, [f.name]: value }));
                                setFieldErrors(prev => ({
                                  ...prev,
                                  topupTexts: { ...(prev.topupTexts || {}), [f.name]: false },
                                }));
                              }}
                              style={hasError ? { border: "1px solid #F50100" } : {}}
                            />
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ opacity: 0.7, padding: 16 }}>{t("product.noData")}</div>
          )}

          {/* ========== FAQ (для всех продуктов, ваучер + пополнение) ========== */}
          <div style={{ marginTop: 40 }}>
            <p className="s-block-h">FAQ</p>

            <div className="quests">
              {voucherFaqItems.map((item) => (
                <div
                  key={item.id}
                  className="quest"
                  onClick={() =>
                    setOpenFaq(openFaq === item.id ? null : item.id)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <p>{t(item.qKey)}</p>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        transform:
                          openFaq === item.id
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        transition: "0.2s",
                      }}
                    >
                      <path
                        d="M18.9882 9C19.8882 9 20.3382 10.077 19.7022 10.706L16.5722 13.802C14.4182 15.934 13.3402 17 12.0002 17C10.6602 17 9.58319 15.934 7.42719 13.802L4.29819 10.706C3.66119 10.076 4.11219 9 5.01319 9C5.28019 9 5.53719 9.105 5.72719 9.293L8.85719 12.388C9.97519 13.494 10.6722 14.178 11.2462 14.611C11.7632 15.001 11.9432 15.001 11.9972 15.001H12.0032C12.0562 15.001 12.2372 15.001 12.7542 14.611C13.3282 14.179 14.0262 13.494 15.1442 12.388L18.2732 9.293C18.4636 9.10498 18.7206 8.99969 18.9882 9Z"
                        fill="#626C77"
                      />
                    </svg>
                  </div>

                  {openFaq === item.id && (
                    <div style={{ maxWidth: 962 }}>
                      <p
                        style={{
                          marginTop: 10,
                          fontSize: 14,
                          color: "#00000099",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: t(item.aKey),
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Оплата + open modal */}
        <div>
          <div className="steam-block">
            <p className="steam-bal-h">{t("product.purchase")}</p>
            <div className="bal-flex">
              <p>{t("product.toCredit")}</p>
              <p>{chosenLabel ? `${chosenLabel}` : "—"}</p>
            </div>
            <div className="bal-flex">
              <p>{t("product.totalToPay")}</p>
              <p>{chosenPrice ? `${chosenPrice} ТМТ` : "—"}</p>
            </div>

            <label className="checkbox" style={{ marginTop: 20 }}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => {
                  const checked = e.target.checked;

                  if (checked) {
                    if (activeTab === "voucher") {
                      const vRegionErr = !region;
                      const vEmailErr = !!emailField && !isValidEmail(userEmail);
                      const voucherProductErr = !selectedVoucher;

                      setFieldErrors(prev => ({
                        ...prev,
                        voucherRegion: vRegionErr,
                        voucherEmail: vEmailErr,
                      }));

                      if (vRegionErr || vEmailErr || voucherProductErr) {
                        setConfirmed(false);
                        return;
                      }
                    } else if (activeTab === "topup") {
                      const regionErr = !topupRegion;
                      const productErr = !selectedTopup;

                      const texts = (topupFields || []).filter(f => f.type === "text");
                      const textErrors = {};
                      let hasTextErr = false;

                      texts.forEach((f) => {
                        const value = String(topupTextValues[f.name] || "").trim();
                        const isEmailField = f.name === (topupEmailField?.name || "");
                        const err = !value || (isEmailField && !isValidEmail(value));
                        textErrors[f.name] = err;
                        if (err) hasTextErr = true;
                      });

                      setFieldErrors(prev => ({
                        ...prev,
                        topupRegion: regionErr,
                        topupProduct: productErr,
                        topupTexts: textErrors,
                      }));

                      if (regionErr || productErr || hasTextErr) {
                        setConfirmed(false);
                        return;
                      }
                    }
                  }

                  setConfirmed(checked);
                }}
              />
              <span className="checkmark"></span>
              <span className="label">{t("product.modalConfirmData")}</span>
            </label>

            <div>
              <button
                type="button"
                className="pay-btn"
                onClick={togglePay}
                disabled={!canPay}
              >
                {t("product.modalPay")}
              </button>
            </div>
          </div>
        </div>

        {/* Modal (Оплата) */}
        <div className={pay ? "steam-pay showpay" : "steam-pay"}>
          <div className="payform">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p className="formhead">{t("product.topupBalance")} {item?.group || "Оплата"}</p>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onClick={togglePay} style={{ cursor: "pointer" }}>
                <path d="M6 6L18 18M18 6L6 18" stroke="black" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="paydata">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p>{t("product.modalRegion")}</p>
                <p>{regionToShow}</p>
              </div>

              {activeTab === "voucher" && emailField && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <p>{emailField.label}</p>
                  <p>{userEmail || "—"}</p>
                </div>
              )}

              {activeTab === "topup" &&
                (topupFields || [])
                  .filter(f => f.type === "text")
                  .map(f => (
                    <div key={`m-${f.name}`} style={{ display: "flex", justifyContent: "space-between" }}>
                      <p>{f.label}</p>
                      <p>{topupTextValues[f.name] || "—"}</p>
                    </div>
                  ))}

              <div className="bal-flex">
                <p>{t("product.toCredit")}</p>
                <p>{chosenLabel ? `${chosenLabel}` : "—"}</p>
              </div>
              <div className="bal-flex">
                <p>{t("product.totalToPay")}</p>
                <p>{chosenPrice ? `${chosenPrice} ТМТ` : "—"}</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "16px 0px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16H12.01M12 8V12M9 4H15L20 9V15L15 20H9L4 15V9L9 4Z"
                  stroke="#F50100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#F50100" }}>
                {t("product.nonRefundable")}
              </p>
            </div>

            <label className="checkbox" style={{ marginTop: 20 }}>
              <input
                type="checkbox"
                checked={modalConfirmed}
                onChange={(e) => setModalConfirmed(e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="label">{t("product.modalConfirmData")}</span>
            </label>

            <div>
              {/* inside the modal footer */}
              <button
                type="button"
                className="pay-btn"
                disabled={!modalConfirmed || paying || !canPay}
                onClick={activeTab === "voucher" ? handleBuyVoucher : handleBuyTopup}
              >
                {paying ? <div className="spinner"></div> : `${t("product.modalPay")}`}
              </button>
              <button type="button" className="pay-btn cancel" onClick={togglePay}>{t("product.modalCancel")}</button>
            </div>
          </div>
          {appAlert.type && (
            <div className="alerts">
              {appAlert.type === "green" && (
                <div className="alt green" role="alert">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 3.93552C14.795 3.33671 13.4368 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 11.662 20.9814 11.3283 20.9451 11M21 5L12 14L9 11" stroke="#50A66A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{appAlert.message}</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" className="alt-close" onClick={closeAlert} xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5L15 15M15 5L5 15" stroke="black" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}

              {appAlert.type === "red" && (
                <div className="alt red" role="alert">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 12H8M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#ED2428" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{appAlert.message}</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" className="alt-close" onClick={closeAlert} xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5L15 15M15 5L5 15" stroke="black" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default Product;