
const categories = [
    {
        title: "학내기관",
        sites: [
            { name: "서울대학교 화학생물공학부", url: "http://cbe.snu.ac.kr/" },
            { name: "서울대학교 공과대학", url: "http://gong.snu.ac.kr" },
            { name: "서울대학교", url: "http://www.snu.ac.kr" },
            { name: "서울대 총동창회", url: "http://www.snua.or.kr" },
            { name: "서울대 공대 동창회", url: "http://www.mysnu.org" },
            { name: "정보화포탈", url: "http://my.snu.ac.kr/portal/site/snuep" },
        ],
    },
    {
        title: "학회",
        sites: [
            { name: "한국 고분자 학회", url: "http://www.polymer.or.kr" },
            { name: "한국 공업 화학회", url: "http://www.ksiec.or.kr" },
            { name: "한국 전기 화학회", url: "http://www.kecs.or.kr" },
            { name: "한국 화학 공학회", url: "http://www.kiche.or.kr" },
        ],
    },
    {
        title: "재단",
        sites: [
            { name: "신양문화재단", url: "http://www.sinyang.org" },
        ],
    },
    {
        title: "기업체",
        sites: [
            { name: "대주전자재료주식회사", url: "http://www.daejoo.co.kr" },
            { name: "동진쎄미켐", url: "http://www.dongjin.com" },
            { name: "아쿠아테크", url: "http://www.aquatech.co.kr" },
        ],
    },
];

export default function FamilySites() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <h1 className="text-3xl font-bold mb-8 text-center text-primary-200">관련사이트</h1>

            <div className="space-y-12">
                {categories.map((category) => (
                    <div key={category.title} className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
                        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4 flex items-center">
                            <span className="w-1.5 h-6 bg-primary-200 rounded-full mr-3"></span>
                            {category.title}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {category.sites.map((site) => (
                                <a
                                    key={site.name}
                                    href={site.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 hover:shadow-md transition-all duration-200 border border-gray-100 group"
                                >
                                    <span className="flex-1 font-medium text-gray-700 group-hover:text-primary-200 transition-colors">
                                        {site.name}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-primary-200 ml-2">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
