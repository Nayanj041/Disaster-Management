import { useState } from "react";
import axiosInstance from "../../lib/axios";

const MultiLanguageAssistantPage = () => {
  const [lang, setLang] = useState("hi");
  const [translated, setTranslated] = useState("");
  const [error, setError] = useState("");

  const translate = async () => {
    try {
      setError("");
      const { data } = await axiosInstance.get("/resilience/translate", {
        params: {
          lang,
          text: "Evacuate Immediately",
        },
      });
      setTranslated(data?.translated || "");
    } catch (err) {
      setError(err?.response?.data?.message || "Translation failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="bg-white rounded-xl border p-5">
          <h1 className="text-2xl font-bold text-gray-900">Multi-Language Assistant</h1>
          <p className="text-gray-600">Translate critical emergency instructions into local languages.</p>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        <div className="bg-white rounded-xl border p-5 flex flex-col md:flex-row gap-2">
          <select className="border rounded-lg px-3 py-2" value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="hi">Hindi</option>
            <option value="bn">Bengali</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
          </select>
          <button className="bg-amber-600 text-white rounded-lg px-4 py-2" onClick={translate}>Translate</button>
        </div>

        {translated && (
          <div className="bg-white rounded-xl border p-5">
            <p className="text-sm text-gray-600">Original: Evacuate Immediately</p>
            <p className="text-xl font-semibold text-gray-900 mt-2">{translated}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiLanguageAssistantPage;
