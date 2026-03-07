import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  List,
  Modal,
  Radio,
  Select,
  Typography,
  message,
  Spin,
} from "antd";
import ReCAPTCHA from "react-google-recaptcha";
import { FiMail, FiHelpCircle, FiCheckCircle } from "react-icons/fi";
// (imagen de ejemplo eliminada — se usa ticket visual inline)
import { FaWhatsapp } from "react-icons/fa";

import axios from "axios";
import type { RadioChangeEvent } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useParams } from "react-router-dom";

const { Title, Text } = Typography;

const ORDER_API = import.meta.env.VITE_POS_ORDER_API as string;

type Order = {
  id: number;
  folio: string;
  folioSeries?: string;
  folioNumber?: string;
  numcheque: string;
  mesa: string | null;
  tableName?: string | null;
  fecha: string; // ISO
  cierre: string | null;
  total: number | string | null;
  subtotal: number | string | null;
  totalimpuesto1: number | string | null;
  invoiceId?: number | null;
  emailedAt?: string | null;
};

type Option = { value: string; label: string };

// ===== Régimen fiscal (taxSystem) =====
const TAX_SYSTEM_OPTIONS: Option[] = [
  { value: "601", label: "601 - General de Ley Personas Morales" },
  { value: "603", label: "603 - Personas Morales con Fines no Lucrativos" },
  {
    value: "605",
    label: "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios",
  },
  { value: "606", label: "606 - Arrendamiento" },
  {
    value: "607",
    label: "607 - Régimen de Enajenación o Adquisición de Bienes",
  },
  { value: "608", label: "608 - Demás ingresos" },
  { value: "609", label: "609 - Consolidación" },
  { value: "610", label: "610 - Residentes en el Extranjero sin EP en México" },
  {
    value: "611",
    label: "611 - Ingresos por Dividendos (socios y accionistas)",
  },
  {
    value: "612",
    label:
      "612 - Personas Físicas con Actividades Empresariales y Profesionales",
  },
  { value: "614", label: "614 - Ingresos por intereses" },
  {
    value: "615",
    label: "615 - Régimen de los ingresos por obtención de premios",
  },
  { value: "616", label: "616 - Sin obligaciones fiscales" },
  {
    value: "620",
    label:
      "620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos",
  },
  { value: "621", label: "621 - Incorporación Fiscal" },
  {
    value: "622",
    label: "622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras",
  },
  { value: "623", label: "623 - Opcional para Grupos de Sociedades" },
  { value: "624", label: "624 - Coordinados" },
  {
    value: "625",
    label:
      "625 - Actividades Empresariales con ingresos a través de Plataformas Tecnológicas",
  },
  { value: "626", label: "626 - Régimen Simplificado de Confianza" },
  { value: "628", label: "628 - Hidrocarburos" },
  {
    value: "629",
    label: "629 - Regímenes Fiscales Preferentes y Multinacionales",
  },
  { value: "630", label: "630 - Enajenación de acciones en bolsa de valores" },
];

// ===== Uso CFDI (depende del régimen) =====
type CfdiUse = { value: string; label: string; allowedTaxSystems: string[] };

const CFDI_USE_OPTIONS: CfdiUse[] = [
  {
    value: "G01",
    label: "G01 - Adquisición de mercancías",
    allowedTaxSystems: [
      "601",
      "603",
      "606",
      "612",
      "620",
      "621",
      "622",
      "623",
      "624",
      "625",
      "626",
    ],
  },
  {
    value: "G02",
    label: "G02 - Devoluciones, descuentos o bonificaciones",
    allowedTaxSystems: [
      "601",
      "603",
      "606",
      "612",
      "620",
      "621",
      "622",
      "623",
      "624",
      "625",
      "626",
    ],
  },
  {
    value: "G03",
    label: "G03 - Gastos en general",
    allowedTaxSystems: [
      "601",
      "603",
      "606",
      "612",
      "620",
      "621",
      "622",
      "623",
      "624",
      "625",
      "626",
    ],
  },

  {
    value: "I01",
    label: "I01 - Construcciones",
    allowedTaxSystems: [
      "601",
      "603",
      "606",
      "612",
      "620",
      "621",
      "622",
      "623",
      "624",
      "625",
      "626",
    ],
  },
  {
    value: "I02",
    label: "I02 - Mobiliario y equipo de oficina por inversiones",
    allowedTaxSystems: [
      "601",
      "603",
      "606",
      "612",
      "620",
      "621",
      "622",
      "623",
      "624",
      "625",
      "626",
    ],
  },
  {
    value: "I03",
    label: "I03 - Equipo de transporte",
    allowedTaxSystems: [
      "601",
      "603",
      "606",
      "612",
      "620",
      "621",
      "622",
      "623",
      "624",
      "625",
      "626",
    ],
  },
  {
    value: "I04",
    label: "I04 - Equipo de cómputo y accesorios",
    allowedTaxSystems: [
      "601",
      "603",
      "606",
      "612",
      "620",
      "621",
      "622",
      "623",
      "624",
      "625",
      "626",
    ],
  },
  {
    value: "I05",
    label: "I05 - Dados, troqueles, moldes, matrices y herramental",
    allowedTaxSystems: [
      "601",
      "603",
      "606",
      "612",
      "620",
      "621",
      "622",
      "623",
      "624",
      "625",
      "626",
    ],
  },
  {
    value: "I06",
    label: "I06 - Comunicaciones telefónicas",
    allowedTaxSystems: [
      "601",
      "603",
      "606",
      "612",
      "620",
      "621",
      "622",
      "623",
      "624",
      "625",
      "626",
    ],
  },
  {
    value: "I07",
    label: "I07 - Comunicaciones satelitales",
    allowedTaxSystems: [
      "601",
      "603",
      "606",
      "612",
      "620",
      "621",
      "622",
      "623",
      "624",
      "625",
      "626",
    ],
  },
  {
    value: "I08",
    label: "I08 - Otra maquinaria y equipo",
    allowedTaxSystems: [
      "601",
      "603",
      "606",
      "612",
      "620",
      "621",
      "622",
      "623",
      "624",
      "625",
      "626",
    ],
  },

  {
    value: "D01",
    label: "D01 - Honorarios médicos, dentales y gastos hospitalarios",
    allowedTaxSystems: [
      "605",
      "606",
      "608",
      "611",
      "612",
      "614",
      "607",
      "615",
      "625",
    ],
  },
  {
    value: "D02",
    label: "D02 - Gastos médicos por incapacidad o discapacidad",
    allowedTaxSystems: [
      "605",
      "606",
      "608",
      "611",
      "612",
      "614",
      "607",
      "615",
      "625",
    ],
  },
  {
    value: "D03",
    label: "D03 - Gastos funerales",
    allowedTaxSystems: [
      "605",
      "606",
      "608",
      "611",
      "612",
      "614",
      "607",
      "615",
      "625",
    ],
  },
  {
    value: "D04",
    label: "D04 - Donativos",
    allowedTaxSystems: [
      "605",
      "606",
      "608",
      "611",
      "612",
      "614",
      "607",
      "615",
      "625",
    ],
  },
  {
    value: "D05",
    label: "D05 - Intereses reales por créditos hipotecarios",
    allowedTaxSystems: [
      "605",
      "606",
      "608",
      "611",
      "612",
      "614",
      "607",
      "615",
      "625",
    ],
  },
  {
    value: "D06",
    label: "D06 - Aportaciones voluntarias al SAR",
    allowedTaxSystems: [
      "605",
      "606",
      "608",
      "611",
      "612",
      "614",
      "607",
      "615",
      "625",
    ],
  },
  {
    value: "D07",
    label: "D07 - Primas por seguros de gastos médicos",
    allowedTaxSystems: [
      "605",
      "606",
      "608",
      "611",
      "612",
      "614",
      "607",
      "615",
      "625",
    ],
  },
  {
    value: "D08",
    label: "D08 - Gastos de transportación escolar obligatoria",
    allowedTaxSystems: [
      "605",
      "606",
      "608",
      "611",
      "612",
      "614",
      "607",
      "615",
      "625",
    ],
  },
  {
    value: "D09",
    label: "D09 - Depósitos en cuentas para el ahorro / planes de pensiones",
    allowedTaxSystems: [
      "605",
      "606",
      "608",
      "611",
      "612",
      "614",
      "607",
      "615",
      "625",
    ],
  },
  {
    value: "D10",
    label: "D10 - Servicios educativos (colegiaturas)",
    allowedTaxSystems: [
      "605",
      "606",
      "608",
      "611",
      "612",
      "614",
      "607",
      "615",
      "625",
    ],
  },

  {
    value: "S01",
    label: "S01 - Sin efectos fiscales",
    allowedTaxSystems: [
      "601",
      "603",
      "605",
      "606",
      "608",
      "610",
      "611",
      "612",
      "614",
      "616",
      "620",
      "621",
      "622",
      "623",
      "624",
      "607",
      "615",
      "625",
      "626",
    ],
  },
  {
    value: "CP01",
    label: "CP01 - Pagos",
    allowedTaxSystems: [
      "601",
      "603",
      "605",
      "606",
      "608",
      "610",
      "611",
      "612",
      "614",
      "616",
      "620",
      "621",
      "622",
      "623",
      "624",
      "607",
      "615",
      "625",
      "626",
    ],
  },
  { value: "CN01", label: "CN01 - Nómina", allowedTaxSystems: ["605"] },
];

// ===== Forma de pago =====
const PAYMENT_FORM_OPTIONS: Option[] = [
  { value: "01", label: "01 - Efectivo" },
  // { value: "02", label: "02 - Cheque nominativo" },
  // { value: "03", label: "03 - Transferencia electrónica de fondos" },
  { value: "04", label: "04 - Tarjeta de crédito" },
  // { value: "05", label: "05 - Monedero electrónico" },
  // { value: "06", label: "06 - Dinero electrónico" },
  // { value: "08", label: "08 - Vales de despensa" },
  // { value: "12", label: "12 - Dación en pago" },
  // { value: "13", label: "13 - Pago por subrogación" },
  // { value: "14", label: "14 - Pago por consignación" },
  // { value: "15", label: "15 - Condonación" },
  // { value: "17", label: "17 - Compensación" },
  // { value: "23", label: "23 - Novación" },
  // { value: "24", label: "24 - Confusión" },
  // { value: "25", label: "25 - Remisión de deuda" },
  // { value: "26", label: "26 - Prescripción o caducidad" },
  // { value: "27", label: "27 - A satisfacción del acreedor" },
  { value: "28", label: "28 - Tarjeta de débito" },
  // { value: "29", label: "29 - Tarjeta de servicios" },
  // { value: "30", label: "30 - Aplicación de anticipos" },
  // { value: "31", label: "31 - Intermediario pagos" },
  // { value: "99", label: "99 - Por definir" },
];

function todayUtcYYYYMMDD() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Public() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const restaurantIdValue = restaurantId?.trim() ?? "";
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [doneModalOpen, setDoneModalOpen] = useState(false);

  const [date, setDate] = useState<string>(() => todayUtcYYYYMMDD());
  const [folioSeries, setFolioSeries] = useState("");
  const [folioNumber, setFolioNumber] = useState("");
  const [total, setTotal] = useState("");
  const [tableName, setTableName] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  //   const [invoiceId, setInvoiceId] = useState<number | null>(null);
  //   const [pdfModalOpen, setPdfModalOpen] = useState(false);
  //   const [sendingEmail, setSendingEmail] = useState(false);
  const [lastCustomerEmail, setLastCustomerEmail] = useState<string>("");
  //   const [zipUrl, setZipUrl] = useState<string>("");

  //   const [pdfUrl, setPdfUrl] = useState("");
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const [form] = Form.useForm();

  const watchedTaxSystem = Form.useWatch("taxSystem", form) || "601";
  const watchedCfdiUse = Form.useWatch("cfdiUse", form);

  const cfdiUseOptions = useMemo(() => {
    return CFDI_USE_OPTIONS.filter((x) =>
      x.allowedTaxSystems.includes(String(watchedTaxSystem)),
    ).map((x) => ({ value: x.value, label: x.label }));
  }, [watchedTaxSystem]);

  useEffect(() => {
    // Si el régimen cambia y el CFDI actual ya no es válido, lo reseteamos al primero permitido
    if (!cfdiUseOptions.length) return;
    const isValid = cfdiUseOptions.some((o) => o.value === watchedCfdiUse);
    if (!isValid) {
      form.setFieldsValue({ cfdiUse: cfdiUseOptions[0].value });
    }
  }, [cfdiUseOptions, watchedCfdiUse, form]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || null,
    [orders, selectedOrderId],
  );

  async function lookup() {
    // setInvoiceId(null);
    // setPdfModalOpen(false);
    // setZipUrl("");

    // setPdfUrl("");
    setOrders([]);
    setSelectedOrderId(null);

    if (!restaurantIdValue) {
      message.error("No se pudo identificar el restaurante.");
      return;
    }

    if (!date || !folioSeries.trim() || !folioNumber.trim() || !total.trim()) {
      message.warning(
        "Ingresa la fecha, serie del folio, número del folio y total.",
      );
      return;
    }

    setLoadingLookup(true);
    try {
      const { data } = await axios.get(`${ORDER_API}/clients/orders`, {
        params: {
          restaurantId: restaurantIdValue,
          folioSeries: folioSeries.trim(),
          folioNumber: folioNumber.trim(),
          date,
          total: total.trim(),
          tableName: tableName.trim(),
        },
      });

      // ✅ Tu OrdersController.findForClient devuelve el objeto directo
      const maybeOrder = data?.id ? data : null;

      // (Opcional) compatibilidad si antes devolvías { orders: [] }
      const list: Order[] = Array.isArray(data?.orders)
        ? data.orders
        : maybeOrder
          ? [maybeOrder]
          : [];

      setOrders(list);

      if (list.length === 0)
        message.info("No se encontró ninguna orden con esos datos.");
      if (list.length === 1) setSelectedOrderId(list[0].id);
      if (list.length > 1)
        message.info("Se encontraron varias. Selecciona la correcta.");
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : "Error de red.";
      message.error(errorMessage);
    } finally {
      setLoadingLookup(false);
    }
  }

  async function generarFactura(values: any) {
    if (!selectedOrderId) {
      message.warning("Selecciona una orden.");
      return;
    }

    if (!restaurantIdValue) {
      message.error("No se pudo identificar el restaurante.");
      return;
    }

    // setPdfUrl("");
    setLoadingInvoice(true);
    try {
      await axios.post(
        `${ORDER_API}/public/invoices`,
        {
          // 🔒 datos para encontrar/validar la order (anti-abuso)
          restaurantId: Number(restaurantIdValue),
          folioSeries: folioSeries.trim(),
          folioNumber: Number(folioNumber.trim()),
          date,
          total: total.trim(),
          tableName: tableName.trim(),

          // captcha
          recaptchaToken,

          // datos fiscales
          customer: {
            legalName: values.legalName,
            taxId: values.taxId,
            taxSystem: values.taxSystem,
            email: values.email,
            zip: values.zip, // 👈 ojo: tu back usa zip directo, no address.zip
          },
          cfdiUse: values.cfdiUse || "G03",
          paymentForm: values.paymentForm || "03",
        },
        { headers: { "Content-Type": "application/json" } },
      );

      // si ya estaba facturada, el back te devolverá alreadyInvoiced + urls
      setLastCustomerEmail(values.email || "");
      setDoneModalOpen(true);

      message.success("Factura generada.");
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : "Error de red.";
      message.error(errorMessage);
    } finally {
      setLoadingInvoice(false);
    }
  }
  //   async function enviarFacturaEmail() {
  //     if (!invoiceId) {
  //       message.warning("No hay invoiceId para enviar.");
  //       return;
  //     }
  //     if (!lastCustomerEmail) {
  //       message.warning("No capturaste email del cliente.");
  //       return;
  //     }

  //     setSendingEmail(true);
  //     try {
  //       const r = await fetch(
  //         `${AUTH_API}/api/invoices/${invoiceId}/send-email`,
  //         {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //       });
  //       const data = await r.json();
  //       if (!r.ok) {
  //         message.error(data?.error || "Error enviando email.");
  //         return;
  //       }
  //       message.success(`Enviado a ${lastCustomerEmail}`);
  //     } catch (e: any) {
  //       message.error(e?.message || "Error de red.");
  //     } finally {
  //       setSendingEmail(false);
  //     }
  //   }
  const isInvoiced = !!selectedOrder?.invoiceId;

  const dateValue: Dayjs | null = date ? dayjs(date, "YYYY-MM-DD") : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="mb-6">
              <Title level={2} className="mb-1">
                SISTEMA DE FACTURACION DE GROWTHSUITE
              </Title>

              <Text type="secondary">
                Busca tu consumo por <b>fecha</b>, <b>serie de folio</b>,{" "}
                <b>numero de folio</b>, <b>total</b> y, si lo conoces,{" "}
                <b>nombre de la mesa</b>. Si hay duplicados, elige el correcto.
              </Text>
            </div>

            <Card className="shadow-sm" title="1) Buscar tu consumo">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-end">
                <div>
                  <Text className="block mb-1" type="secondary">
                    Fecha (YYYY-MM-DD)
                  </Text>
                  <DatePicker
                    className="w-full"
                    value={dateValue}
                    format="YYYY-MM-DD"
                    onChange={(v) => setDate(v ? v.format("YYYY-MM-DD") : "")}
                    placeholder="YYYY-MM-DD"
                  />
                </div>

                <div>
                  <Text className="block mb-1" type="secondary">
                    Serie del folio
                  </Text>
                  <Input
                    value={folioSeries}
                    onChange={(e) => setFolioSeries(e.target.value)}
                    placeholder="Ej: A"
                  />
                </div>

                <div>
                  <Text className="block mb-1" type="secondary">
                    Número de folio
                  </Text>
                  <Input
                    value={folioNumber}
                    onChange={(e) => setFolioNumber(e.target.value)}
                    placeholder="Ej: 12345"
                  />
                </div>

                <div>
                  <Text className="block mb-1" type="secondary">
                    Total
                  </Text>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    placeholder="Ej: 1324.67"
                  />
                </div>

                <div>
                  <Text className="block mb-1" type="secondary">
                    Nombre de la mesa
                  </Text>
                  <Input
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="Ej: Terraza A"
                  />
                </div>

                <Text className="block mt-1 text-xs" type="secondary">
                  Tip: tu API busca por combinaciones de folio y total.
                </Text>
                <Button
                  type="primary"
                  onClick={lookup}
                  disabled={loadingLookup}
                >
                  {loadingLookup ? (
                    <>
                      <Spin size="small" />{" "}
                      <span className="ml-2">Buscando...</span>
                    </>
                  ) : (
                    "Buscar"
                  )}
                </Button>
              </div>

              {orders.length > 0 && (
                <div className="mt-5">
                  <Text strong>Resultados</Text>

                  <div className="mt-3">
                    <Radio.Group
                      onChange={(e: RadioChangeEvent) =>
                        setSelectedOrderId(Number(e.target.value))
                      }
                      value={selectedOrderId ?? undefined}
                      className="w-full"
                    >
                      <List
                        bordered
                        dataSource={orders}
                        renderItem={(o) => (
                          <List.Item className="px-3">
                            <Radio value={o.id} className="w-full">
                              <div className="flex flex-col gap-1">
                                <div className="font-semibold">
                                  Folio:{" "}
                                  {o.folioNumber ?? o.numcheque ?? o.folio}
                                  {o.folioSeries ? (
                                    <> · Serie: {o.folioSeries}</>
                                  ) : null}
                                  {" · "}ID: {o.id}
                                  {o.invoiceId ? (
                                    <span className="ml-2 text-xs text-green-600">
                                      FACTURADA
                                    </span>
                                  ) : null}
                                </div>
                                <div className="text-slate-600 text-sm">
                                  Fecha: {o.fecha}{" "}
                                  {(o.tableName ?? o.mesa)
                                    ? `· Mesa: ${o.tableName ?? o.mesa}`
                                    : ""}{" "}
                                  · Total: {String(o.total ?? "")}
                                </div>
                              </div>
                            </Radio>
                          </List.Item>
                        )}
                      />
                    </Radio.Group>
                  </div>
                </div>
              )}
            </Card>

            <div className="mt-6">
              <Card
                className="shadow-sm"
                title="2) Datos fiscales"
                extra={
                  selectedOrder ? (
                    <Text type="secondary">
                      Orden: <b>ID {selectedOrder.id}</b> · Total:{" "}
                      <b>{String(selectedOrder.total ?? "")}</b>
                    </Text>
                  ) : (
                    <Text type="secondary">
                      Selecciona una orden para continuar
                    </Text>
                  )
                }
              >
                {isInvoiced ? (
                  <div className="flex flex-col gap-2">
                    <Text>
                      Esta orden ya tiene factura. Si no la recibiste, contacta
                      a administración.
                    </Text>
                  </div>
                ) : (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={generarFactura}
                    disabled={!selectedOrder}
                    initialValues={{
                      taxSystem: "601",
                      cfdiUse: "G03",
                      paymentForm: "03",
                    }}
                  >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Form.Item
                        label="Razón social / Nombre"
                        name="legalName"
                        rules={[
                          {
                            required: true,
                            message: "Este campo es obligatorio",
                          },
                        ]}
                      >
                        <Input placeholder="Ej: Juan Pérez SA de CV" />
                      </Form.Item>
                      <Form.Item
                        label="Régimen fiscal"
                        name="taxSystem"
                        rules={[
                          {
                            required: true,
                            message: "Este campo es obligatorio",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          options={TAX_SYSTEM_OPTIONS}
                          placeholder="Selecciona régimen fiscal"
                          optionFilterProp="label"
                        />
                      </Form.Item>

                      <Form.Item
                        label="RFC"
                        name="taxId"
                        rules={[
                          {
                            required: true,
                            message: "Este campo es obligatorio",
                          },
                        ]}
                      >
                        <Input placeholder="Ej: XAXX010101000" />
                      </Form.Item>

                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          {
                            required: true,
                            message: "El email es obligatorio",
                          },
                          { type: "email", message: "Email inválido" },
                        ]}
                      >
                        <Input placeholder="correo@ejemplo.com" />
                      </Form.Item>

                      <Form.Item label="Código Postal (CP)" name="zip">
                        <Input placeholder="Ej: 03100" />
                      </Form.Item>

                      <Form.Item
                        label="Uso CFDI"
                        name="cfdiUse"
                        rules={[
                          { required: true, message: "Selecciona el uso CFDI" },
                        ]}
                      >
                        <Select
                          showSearch
                          options={cfdiUseOptions}
                          placeholder="Selecciona uso CFDI"
                          optionFilterProp="label"
                          disabled={!cfdiUseOptions.length}
                        />
                      </Form.Item>

                      <Form.Item
                        label="Forma de pago"
                        name="paymentForm"
                        rules={[
                          {
                            required: true,
                            message: "Selecciona la forma de pago",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          options={PAYMENT_FORM_OPTIONS}
                          placeholder="Selecciona forma de pago"
                          optionFilterProp="label"
                        />
                      </Form.Item>
                    </div>
                    <div className="mt-2">
                      <Text type="secondary" className="block mb-2">
                        Verificación anti-robot
                      </Text>
                      <ReCAPTCHA
                        sitekey={
                          import.meta.env.VITE_RECAPTCHA_SITE_KEY as string
                        }
                        onChange={(token) => setRecaptchaToken(token)}
                      />
                    </div>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loadingInvoice}
                      disabled={!recaptchaToken}
                    >
                      Generar factura
                    </Button>
                  </Form>
                )}
              </Card>
            </div>

            {/* <Modal
              open={pdfModalOpen}
              onCancel={() => setPdfModalOpen(false)}
              footer={null}
              width={980}
              title="Factura (PDF)"
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button href={pdfUrl} target="_blank" disabled={!pdfUrl}>
                    Abrir / Descargar PDF
                  </Button>

                  <Button href={zipUrl} target="_blank" disabled={!zipUrl}>
                    Descargar ZIP (PDF+XML)
                  </Button>

                  <Button
                    type="primary"
                    onClick={enviarFacturaEmail}
                    loading={sendingEmail}
                    disabled={!invoiceId || !lastCustomerEmail}
                  >
                    Enviar a email
                  </Button>

                  <Text type="secondary" className="truncate">
                    {lastCustomerEmail
                      ? `Enviar a: ${lastCustomerEmail}`
                      : "Sin email capturado"}
                  </Text>
                </div>

                <div className="h-[350px] w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <iframe src={pdfUrl} className="h-full w-full" />
                </div>
              </div>
            </Modal> */}
            <Modal
              open={doneModalOpen}
              onCancel={() => setDoneModalOpen(false)}
              footer={null}
              title={null}
            >
              <div className="flex items-start gap-3">
                <div className="text-green-600 text-2xl mt-1">
                  <FiCheckCircle />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold">
                    Factura enviada al correo
                  </h3>
                  <p className="text-slate-600">
                    Tu factura fue enviada al correo <b>{lastCustomerEmail}</b>.
                    Gracias. Cualquier inconveniente, contacta a un
                    administrador de Cantina La Llorona.
                  </p>

                  <div className="mt-2 flex flex-col gap-2 text-slate-700">
                    <div className="flex items-center gap-2">
                      <FiMail /> <span>facturacion@cantilallorona.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href="https://wa.me/525549242477?text=Hola%20Cantina%20La%20Llorona,%20quiero%20ayuda%20con%20mi%20factura."
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                      >
                        <FaWhatsapp className="text-lg" />
                        <span>Consultar por WhatsApp</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <FiHelpCircle />{" "}
                      <span>Horario: Lun–Dom 13:00 pm–22:00 pm</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {/* <Button
                      type="primary"
                      onClick={() => {
                        setDoneModalOpen(false);
                        // setPdfModalOpen(true);
                      }}
                    >
                      Ver PDF
                    </Button> */}
                    <Button onClick={() => setDoneModalOpen(false)}>
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            </Modal>
          </div>

          {/* DERECHA: tutorial */}
          <div className="lg:sticky lg:top-6 h-fit space-y-4">
            <Card
              className="shadow-sm"
              title="¿Cómo encuentro mis datos?"
            >
              <Text type="secondary">
                Busca en tu ticket de consumo los datos que se resaltan abajo.
                Cada campo marcado corresponde a un campo del formulario.
              </Text>

              {/* ── Mock Ticket ── */}
              <div className="mt-4 mx-auto max-w-[300px] bg-white border border-slate-300 rounded-lg shadow-inner font-mono text-xs leading-relaxed">
                {/* Header */}
                <div className="px-4 pt-4 pb-2 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-lg">
                    R
                  </div>
                  <div className="font-bold text-sm text-slate-700">RESTAURANTE</div>
                  <div className="text-[10px] text-slate-400">Calle Ejemplo #123, Col. Centro</div>
                  <div className="text-[10px] text-slate-400">Tel: 55 1234 5678</div>
                </div>

                <div className="border-t border-dashed border-slate-300 mx-3" />

                {/* Datos destacados */}
                <div className="px-4 py-2 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Orden:</span>
                    <span className="text-slate-600">#1042</span>
                  </div>

                  {/* Serie de folio */}
                  <div className="flex justify-between items-center rounded-md bg-blue-50 border border-blue-300 px-2 py-1 -mx-2">
                    <span className="text-blue-700 font-semibold">Serie de Folio:</span>
                    <span className="text-blue-800 font-bold">A</span>
                  </div>

                  {/* Numero de folio */}
                  <div className="flex justify-between items-center rounded-md bg-blue-50 border border-blue-300 px-2 py-1 -mx-2">
                    <span className="text-blue-700 font-semibold">No. Folio:</span>
                    <span className="text-blue-800 font-bold">587</span>
                  </div>

                  {/* Mesa */}
                  <div className="flex justify-between items-center rounded-md bg-amber-50 border border-amber-300 px-2 py-1 -mx-2">
                    <span className="text-amber-700 font-semibold">Mesa:</span>
                    <span className="text-amber-800 font-bold">Terraza 3</span>
                  </div>

                  {/* Fecha */}
                  <div className="flex justify-between items-center rounded-md bg-green-50 border border-green-300 px-2 py-1 -mx-2">
                    <span className="text-green-700 font-semibold">Fecha:</span>
                    <span className="text-green-800 font-bold">07/03/2026 14:32</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300 mx-3" />

                {/* Items */}
                <div className="px-4 py-2 space-y-1 text-slate-500">
                  <div className="flex justify-between">
                    <span>2 x Platillo del dia</span>
                    <span>$320.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1 x Bebida</span>
                    <span>$85.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1 x Postre</span>
                    <span>$110.00</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300 mx-3" />

                {/* Totales */}
                <div className="px-4 py-2 space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>$443.97</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>IVA</span>
                    <span>$71.03</span>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center rounded-md bg-purple-50 border border-purple-300 px-2 py-1.5 -mx-2">
                    <span className="text-purple-700 font-bold text-sm">TOTAL</span>
                    <span className="text-purple-800 font-bold text-sm">$515.00</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300 mx-3" />

                {/* Footer */}
                <div className="px-4 py-3 text-center">
                  <div className="text-[10px] text-slate-400">Gracias por su preferencia</div>
                  <div className="text-[9px] text-slate-300 mt-1">GROWTHSUITE - POS</div>
                </div>
              </div>

              {/* Leyenda de colores */}
              <div className="mt-4 space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-sm bg-blue-300 border border-blue-400" />
                  <span className="text-slate-600"><b>Serie de Folio</b> y <b>No. Folio</b> — campos obligatorios</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-sm bg-green-300 border border-green-400" />
                  <span className="text-slate-600"><b>Fecha</b> — dia en que se realizo el consumo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-sm bg-purple-300 border border-purple-400" />
                  <span className="text-slate-600"><b>Total</b> — el monto total del ticket</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-sm bg-amber-300 border border-amber-400" />
                  <span className="text-slate-600"><b>Mesa</b> — opcional, ayuda si hay duplicados</span>
                </div>
              </div>
            </Card>

            <Card className="shadow-sm" title="¿Necesitas ayuda?">
              <div className="flex items-center gap-2">
                <a
                  href="https://wa.me/525549242477?text=Hola,%20quiero%20ayuda%20con%20mi%20factura."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                >
                  <FaWhatsapp className="text-lg" />
                  <span>Consultar por WhatsApp</span>
                </a>
              </div>
              <Text type="secondary" className="block mt-2 text-xs">
                Comunicate con el restaurante donde realizaste tu consumo
                para que te apoyen con tus datos de facturacion.
              </Text>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
