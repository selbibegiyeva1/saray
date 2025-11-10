import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../lib/api";

import "../styles/Login.css";

function Product() {
  const { state } = useLocation();
  const { group_id, group_name } = state || {};

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    (!emailField || userEmail.trim() !== "") &&
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
    confirmed;

  const canPay = activeTab === "voucher" ? canPayVoucher : canPayTopup;

  const hasVoucher = Array.isArray(voucherFields) && voucherFields.length > 0;
  const hasTopup = Array.isArray(topupFields) && topupFields.length > 0;

  // close modal when alert appears, and auto-hide after 5s
  useEffect(() => {
    if (appAlert.type) {
      setPay(false);
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
    if (emailField && !String(userEmail).trim()) {
      setAppAlert({ type: "red", message: "Введите email" });
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
        const successMsg = data?.comment || data?.message || "Покупка успешно создана. Продолжите в новой вкладке.";
        setAppAlert({ type: "green", message: successMsg });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // backend returned explicit failure
      const errMsg = data?.comment || data?.message || "Не удалось купить ваучер";
      setAppAlert({ type: "red", message: errMsg });
    } catch (e) {
      const errMsg = e?.response?.data?.comment || e?.response?.data?.message || "Ошибка покупки ваучера";
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

    // Minimal guards (you already gate the pay button with canPayTopup)
    if (!payload.product_id) {
      setAppAlert({ type: "red", message: "Выберите товар" });
      return;
    }

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
        const successMsg = data?.comment || data?.message || "Покупка успешно создана. Продолжите в новой вкладке.";
        setAppAlert({ type: "green", message: successMsg });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // explicit backend failure
      const errMsg = data?.comment || data?.message || "Не удалось оформить пополнение";
      setAppAlert({ type: "red", message: errMsg });
    } catch (e) {
      const errMsg = e?.response?.data?.comment || e?.response?.data?.message || "Ошибка оформления пополнения";
      setAppAlert({ type: "red", message: errMsg });
    } finally {
      setPaying(false);
    }
  }

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
                    <p className="s-block-h">Пополнение баланса {item.group}</p>
                    <span>{item.short_info}</span>

                    {/* Switcher: render only buttons that exist */}
                    <div className="s-block-btns" style={{ marginTop: 8 }}>
                      {hasTopup && (
                        <button
                          type="button"
                          className={activeTab === "topup" ? "active" : ""}
                          onClick={() => setActiveTab("topup")}
                        >
                          Пополнение
                        </button>
                      )}
                      {hasVoucher && (
                        <button
                          type="button"
                          className={activeTab === "voucher" ? "active" : ""}
                          onClick={() => setActiveTab("voucher")}
                        >
                          Ваучер
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ========== VOUCHER TAB ONLY ========== */}
              {activeTab === "voucher" && hasVoucher && (
                <>
                  <div className="steam-block" style={{ marginTop: 16 }}>
                    <p className="s-block-h">Выберите регион</p>
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
                        }}
                        disabled={!regionOptions.length}
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
                        <b>Выберите номинал</b>
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
                    <p className="s-block-h">Оформление покупки</p>

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
                          onChange={(e) => setUserEmail(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ========== TOPUP TAB ONLY ========== */}
              {activeTab === "topup" && hasTopup && (
                <div className="steam-block" style={{ marginTop: 16 }}>
                  <p className="s-block-h">Оформление покупки</p>

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
                                onChange={(e) => setTopupRegion(e.target.value)}
                                disabled={!topupRegionOptions.length}
                              >
                                {topupRegionOptions.length ? (
                                  topupRegionOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.name}
                                    </option>
                                  ))
                                ) : (
                                  <option>Регионы недоступны</option>
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
                                  }}
                                  title={`${p.product} — ${p.price} ТМТ`}
                                >
                                  {p.product}
                                </button>
                              ))}
                              {filteredTopupProducts.length === 0 && (
                                <div style={{ opacity: 0.7 }}>Нет доступных товаров</div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // any text fields (e.g., account/ID, etc.)
                      if (f.type === "text") {
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
                              onChange={(e) =>
                                setTopupTextValues(prev => ({ ...prev, [f.name]: e.target.value }))
                              }
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
            <div style={{ opacity: 0.7, padding: 16 }}>Нет данных</div>
          )}
        </div>

        {/* Right column: Оплата + open modal */}
        <div>
          <div className="steam-block">
            <p className="steam-bal-h">Оплата</p>
            <div className="bal-flex">
              <p>К зачислению</p>
              <p>{chosenLabel ? `${chosenLabel}` : "—"}</p>
            </div>
            <div className="bal-flex">
              <p>Итого к списанию</p>
              <p>{chosenPrice ? `${chosenPrice} ТМТ` : "—"}</p>
            </div>

            <label className="checkbox" style={{ marginTop: 20 }}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="label">Я подтверждаю, что правильно указал все данные</span>
            </label>

            <div>
              <button
                type="button"
                className="pay-btn"
                onClick={togglePay}
                disabled={!canPay}
              >
                Оплатить
              </button>
            </div>
          </div>
        </div>

        {/* Modal (Оплата) */}
        <div className={pay ? "steam-pay showpay" : "steam-pay"}>
          <div className="payform">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p className="formhead">Пополнение баланса {item?.group || "Оплата"}</p>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onClick={togglePay} style={{ cursor: "pointer" }}>
                <path d="M6 6L18 18M18 6L6 18" stroke="black" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="paydata">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p>Регион</p>
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
                <p>К зачислению</p>
                <p>{chosenLabel ? `${chosenLabel}` : "—"}</p>
              </div>
              <div className="bal-flex">
                <p>Итого к списанию</p>
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
                Товар возврату не подлежит
              </p>
            </div>

            <label className="checkbox" style={{ marginTop: 20 }}>
              <input
                type="checkbox"
                checked={modalConfirmed}
                onChange={(e) => setModalConfirmed(e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="label">Я подтверждаю, что правильно указал все данные</span>
            </label>

            <div>
              {/* inside the modal footer */}
              <button
                type="button"
                className="pay-btn"
                disabled={!modalConfirmed || paying || !canPay}
                onClick={activeTab === "voucher" ? handleBuyVoucher : handleBuyTopup}
              >
                {paying ? <div className="spinner"></div> : "Оплатить"}
              </button>
              <button type="button" className="pay-btn cancel" onClick={togglePay}>Отмена</button>
            </div>
          </div>
        </div>
      </form>

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
  );
}

export default Product;