import { Typography } from "antd";

const { Title, Text } = Typography;
const LOGO_URL = "/logo_growth.png";

export default function RouteHelp() {
  return (
    <div className="gs-warm-bg min-h-[100svh] w-full">
      <div className="mx-auto flex min-h-[100svh] max-w-2xl items-start px-4 pb-12 pt-8 sm:pt-12">
        <div className="gs-fade-up w-full rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_20px_60px_-30px_rgba(31,122,224,0.35)] backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Growthsuite"
              className="h-9 w-auto"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>
          <div className="mt-4">
            <div className="flex flex-col gap-4">
              <div>
                <Title level={3} className="!mb-1 text-slate-900">
                  Llegaste aqui por error?
                </Title>
                <Text className="text-slate-600">
                  No te preocupes. Solo necesitas la liga oficial del
                  restaurante.
                </Text>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-800">
                  Recomendacion rapida
                </div>
                <Text className="text-sm text-slate-600">
                  Busca en tu ticket o recibo. Algunos restaurantes incluyen la
                  liga de facturacion.
                </Text>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-800">
                  Ayuda al cliente
                </div>
                <Text className="text-sm text-slate-600">
                  Si necesitas soporte, comunicate con el restaurante donde
                  realizaste tu consumo.
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
