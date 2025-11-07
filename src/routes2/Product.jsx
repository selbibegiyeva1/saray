import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../lib/api";

function Product() {
  const { state } = useLocation();
  const { group_id, group_name } = state || {};

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // region + voucher selection
  const [region, setRegion] = useState("");
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // purchase form (email)
  const [userEmail, setUserEmail] = useState("");

  // sidebar confirmation + modal state (like Steam)
  const [confirmed, setConfirmed] = useState(false);
  const [pay, setPay] = useState(false);
  const [modalConfirmed, setModalConfirmed] = useState(false);

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

  // regions from forms.voucher_fields where name === "region"
  const regionOptions = useMemo(() => {
    const fields = item?.forms?.voucher_fields || [];
    const field = fields.find(f => f?.name === "region" && f?.type === "options");
    return Array.isArray(field?.options) ? field.options : [];
  }, [item]);

  // vouchers from forms.voucher_fields where name === "product_id"
  const voucherProducts = useMemo(() => {
    const fields = item?.forms?.voucher_fields || [];
    const field = fields.find(f => f?.name === "product_id" && f?.type === "options");
    return Array.isArray(field?.options) ? field.options : [];
  }, [item]);

  // selected region name (human) to match product option.region (e.g., "США")
  const selectedRegionName = useMemo(() => {
    return regionOptions.find(r => r.value === region)?.name || "";
  }, [region, regionOptions]);

  // filter voucher products by region
  const filteredVouchers = useMemo(() => {
    if (!selectedRegionName) return [];
    return voucherProducts.filter(p => {
      const pr = (p.region || "").toLowerCase();
      return pr === selectedRegionName.toLowerCase() || pr === region.toLowerCase();
    });
  }, [voucherProducts, selectedRegionName, region]);

  // set default region once options load
  useEffect(() => {
    if (regionOptions.length && !region) {
      setRegion(regionOptions[0].value);
    }
  }, [regionOptions, region]);

  // clear voucher selection when region changes
  useEffect(() => {
    setActiveVoucher(null);
    setSelectedVoucher(null);
  }, [region]);

  // open/close modal
  const togglePay = () => {
    setPay(prev => {
      const next = !prev;
      if (next) setModalConfirmed(false); // reset when opening
      return next;
    });
  };

  // enable/disable main "Оплатить"
  const canPay =
    confirmed &&
    region &&
    selectedVoucher &&
    userEmail.trim() !== "";

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
                    {/* group */}
                    <p className="s-block-h">Пополнение баланса {item.group}</p>
                    {/* short_info */}
                    <span>{item.short_info}</span>
                  </div>
                </div>
              </div>

              {/* Region + vouchers */}
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
                    onChange={(e) => setRegion(e.target.value)}
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

              {/* Оформление покупки + dynamic email field */}
              <div className="steam-block" style={{ marginTop: 16 }}>
                <p className="s-block-h">Оформление покупки</p>
                {(() => {
                  const fields = item?.forms?.voucher_fields || [];
                  const emailField = fields.find(f => f.name === "email");
                  if (!emailField) return null;

                  return (
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
                  );
                })()}
              </div>
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
              <p>{selectedVoucher ? `~ ${selectedVoucher.product}` : "—"}</p>
            </div>
            <div className="bal-flex">
              <p>Итого к списанию</p>
              <p>{selectedVoucher ? `${selectedVoucher.price} ТМТ` : "—"}</p>
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

        {/* Modal (Оплата) — same UX as Steam */}
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
                <p>{selectedRegionName || "—"}</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p>Email</p>
                <p>{userEmail || "—"}</p>
              </div>

              <div className="bal-flex">
                <p>К зачислению</p>
                <p>{selectedVoucher ? `~ ${selectedVoucher.product}` : "—"}</p>
              </div>
              <div className="bal-flex">
                <p>Итого к списанию</p>
                <p>{selectedVoucher ? `${selectedVoucher.price} ТМТ` : "—"}</p>
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

            <div className="paydata">
              <div className="bal-flex">
                <p>К зачислению</p>
                <p>~{selectedVoucher ? selectedVoucher.product : "—"}</p>
              </div>
              <div className="bal-flex">
                <p>Итого к списанию</p>
                <p>{selectedVoucher ? `${selectedVoucher.price} ТМТ` : "—"}</p>
              </div>
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
              <button type="button" className="pay-btn" disabled={!modalConfirmed}>
                Оплатить
              </button>
              <button type="button" className="pay-btn cancel" onClick={togglePay}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Product;