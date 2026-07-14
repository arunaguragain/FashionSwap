import ResetPasswordForm from "../../_components/ResetPasswordForm";

interface Props {
  params: { token: string };
}

export default function Page({ params }: Props) {
  const { token } = params;
  return (

    <div className="h-screen flex items-start justify-center py-0 px-0">
      <div className="w-full max-w-none mx-auto px-0 md:px-6 bg-blue-50 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm min-h-[480px] md:min-h-[600px]" style={{ width: 'min(1150px, calc(100vw - 140px))', maxWidth: '1150px', paddingLeft: 0, paddingRight: 0 }}>
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-7/12 flex items-center justify-center">
              <div className="w-full h-full rounded-tr-2xl rounded-br-2xl md:rounded-l-2xl md:rounded-r-none overflow-hidden flex items-center justify-center">
                <img
                  src="/images/reset.png"
                  alt="reset illustration"
                  className="w-full max-w-none h-80 md:h-[520px] object-contain"
                />
              </div>
            </div>
  
            <div className="w-full md:w-5/12 flex items-center justify-center">
              <div className="w-full">
                <ResetPasswordForm token={token} />
              </div>
            </div>
          </div>
        </div>
     </div>
  );
}
