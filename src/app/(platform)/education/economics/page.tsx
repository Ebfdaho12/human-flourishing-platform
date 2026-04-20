"use client"

import { useState } from "react"
import {
  GraduationCap, ChevronDown, Lightbulb, BookOpen, Scale, Landmark,
  TrendingUp, AlertTriangle, Coins, Users, Globe2, DollarSign, Banknote,
  ShieldCheck, ArrowRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

function Simple({ text, simple }: { text: string; simple: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline">
      <span>{text}</span>
      <button onClick={() => setShow(!show)}
        className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-violet-100 text-violet-600 text-[9px] font-bold ml-1 align-super cursor-pointer hover:bg-violet-200"
        title="Simple explanation">?</button>
      {show && (
        <span className="block mt-1 mb-2 rounded-lg bg-violet-50 border border-violet-200 px-3 py-2 text-xs text-violet-700 leading-relaxed">
          <Lightbulb className="h-3 w-3 inline mr-1" /><strong>Simply put:</strong> {simple}
        </span>
      )}
    </span>
  )
}

// ────────────────────────────────────────────
// Schools of economic thought
// ────────────────────────────────────────────
const SCHOOLS = [
  {
    name: "Austrian Economics",
    taught: false,
    color: "from-amber-500 to-orange-600",
    founders: "Carl Menger, Ludwig von Mises, Friedrich Hayek, Murray Rothbard",
    era: "1871 — present",
    coreIdeas: [
      {
        title: "Subjective Value Theory",
        standard: "The value of any good is determined by the individual who wants it, not by the labor that produced it. A glass of water is worth almost nothing at home but priceless in the desert. Value is subjective.",
        simple: "Things are worth whatever someone is willing to pay — not what it cost to make them. A painting by a famous artist and a painting by your neighbor take the same time, but one is worth millions.",
      },
      {
        title: "The Business Cycle (Austrian theory)",
        standard: "When central banks artificially lower interest rates, they send false signals to entrepreneurs. Businesses invest in projects that seem profitable at low rates but are not sustainable. This creates a boom. When reality catches up, the bust follows. The boom IS the problem — the bust is the cure.",
        simple: "Imagine a store puts everything on sale, but it is fake — prices go back up next week. People buy things they cannot afford thinking the sale is real. When prices go back up, everyone is stuck with stuff they cannot pay for. That is what cheap money does to the whole economy.",
      },
      {
        title: "Sound Money",
        standard: "Money should not be printable at will by governments. When money supply expands faster than goods produced, each dollar buys less. This is a hidden tax on savings. Austrians advocate for money tied to scarce assets (gold, Bitcoin) rather than government promises.",
        simple: "If your teacher gave everyone in class an A, an A would mean nothing. If the government prints trillions of dollars, each dollar means less. Your savings lose value even if the number stays the same.",
      },
      {
        title: "Spontaneous Order",
        standard: "Complex social systems (language, markets, law) emerge from individual action without central planning. No one designed the English language or decided what a fair price for bread should be. Millions of individual decisions create order naturally.",
        simple: "Nobody planned where every store in your city should go. People just opened shops where customers were, and over time a natural order emerged that works better than any plan could.",
      },
      {
        title: "The Calculation Problem",
        standard: "Without free-market prices, no central planner can efficiently allocate resources. Mises proved in 1920 that socialist economies cannot calculate — they have no price signals to tell them what to produce, how much, or for whom. This is why every centrally planned economy has produced shortages.",
        simple: "Imagine planning meals for a million people without knowing what anyone likes, what is in season, or what anything costs. That is what central planning tries to do with an entire economy. It always fails because one person cannot know what millions of people need.",
      },
    ],
    whyNotTaught: "Austrian economics challenges the idea that governments and central banks should manage the economy. Since most economics departments receive funding connected to government institutions, and most economic advisors work for governments, teaching a school of thought that says 'the government should do less' is not popular in those circles.",
    keyBooks: [
      { title: "Economics in One Lesson", author: "Henry Hazlitt", note: "The best starting point — short, clear, devastating" },
      { title: "The Road to Serfdom", author: "Friedrich Hayek", note: "How central planning leads to tyranny, even with good intentions" },
      { title: "Human Action", author: "Ludwig von Mises", note: "The comprehensive treatise — dense but foundational" },
      { title: "What Has Government Done to Our Money?", author: "Murray Rothbard", note: "Short, accessible history of money and inflation" },
    ],
  },
  {
    name: "Monetarism (Chicago School)",
    taught: "partially",
    color: "from-blue-500 to-indigo-600",
    founders: "Milton Friedman, Anna Schwartz, George Stigler",
    era: "1950s — present",
    coreIdeas: [
      {
        title: "Inflation Is Always a Monetary Phenomenon",
        standard: "Friedman's most famous insight: inflation is caused by too much money chasing too few goods. When governments print money faster than the economy grows, prices rise. This is not caused by greedy corporations or wage increases — it is caused by the money supply.",
        simple: "If everyone in town suddenly got $1 million, would things cost the same? No — every seller would raise prices because everyone has more money. That is inflation. More money in the system = higher prices for everything.",
      },
      {
        title: "The Permanent Income Hypothesis",
        standard: "People base spending not on current income but on expected lifetime income. A medical student earning $0 still spends more than a minimum-wage worker because they expect future high income. This means one-time stimulus checks have minimal long-term economic impact.",
        simple: "You do not spend based on what is in your pocket today — you spend based on what you think you will earn over your whole life. That is why a student with loans is not as worried as someone who thinks they will never earn more.",
      },
      {
        title: "Free Markets + Stable Money Supply",
        standard: "Friedman believed markets work best when free, but unlike Austrians, he accepted a role for central banks — specifically, to grow the money supply at a steady, predictable rate matching economic growth. No surprises, no manipulation.",
        simple: "The economy is like a garden. Friedman said: do not over-water it or under-water it. Just give it a steady drip of water (money) and let the plants (businesses) figure out the rest.",
      },
      {
        title: "School Choice & Competition",
        standard: "Friedman argued that government monopoly on education produces poor outcomes because there is no competition. He proposed school vouchers — give parents money and let them choose the school, public or private. Schools that fail to educate would lose students and close.",
        simple: "If the only restaurant in town was government-run, the food would be terrible because there is no reason to improve. Friedman said education works the same way — give families a choice and schools have to get better or lose students.",
      },
      {
        title: "The Tyranny of the Status Quo",
        standard: "Government programs, once created, almost never end. They develop constituencies (employees, recipients, contractors) who fight to maintain them even when the program fails. This is why government grows in one direction only — larger.",
        simple: "Once a government starts a program, the people who work there and the people who receive the benefits will fight forever to keep it — even if it does not work. That is why governments only get bigger, never smaller.",
      },
    ],
    whyNotTaught: "Friedman is occasionally mentioned but his most challenging ideas (end the Federal Reserve's discretionary power, abolish the Department of Education, legalize drugs, eliminate occupational licensing) are rarely taught because they challenge institutional power.",
    keyBooks: [
      { title: "Free to Choose", author: "Milton Friedman", note: "His most accessible work — also a PBS TV series" },
      { title: "Capitalism and Freedom", author: "Milton Friedman", note: "The intellectual case for economic liberty" },
      { title: "A Monetary History of the United States", author: "Friedman & Schwartz", note: "Proved the Fed caused the Great Depression by contracting money supply" },
    ],
  },
  {
    name: "Keynesian Economics",
    taught: true,
    color: "from-green-500 to-emerald-600",
    founders: "John Maynard Keynes, Paul Samuelson, Paul Krugman",
    era: "1936 — present (dominant in universities)",
    coreIdeas: [
      {
        title: "Government Should Manage Demand",
        standard: "When the economy slows, people spend less, businesses earn less, they fire workers, who spend even less — a downward spiral. Keynes argued that government should step in and spend (even at a deficit) to replace the missing private spending and break the cycle.",
        simple: "When nobody is buying anything, Keynes said the government should be the buyer — build roads, hire people, give out money — to get things moving again. Like jump-starting a dead car.",
      },
      {
        title: "The Multiplier Effect",
        standard: "Government spending creates a chain reaction. If the government pays $1,000 to build something, that worker spends $800 at local stores, those store owners spend $640, and so on. The original $1,000 generates $3,000-$5,000 in total economic activity.",
        simple: "One dollar from the government bounces around the economy multiple times. You pay a worker, they buy groceries, the grocer pays rent, the landlord hires a plumber — one dollar becomes five.",
      },
      {
        title: "Deficit Spending Is Acceptable",
        standard: "Keynes argued that governments should run deficits (spend more than they collect in taxes) during recessions, and pay down debt during booms. In practice, governments adopted the first half (spend during bad times) and ignored the second half (save during good times).",
        simple: "Keynes said borrow during hard times, repay during good times. But governments only heard the first part. They borrow ALL the time. That is not what he actually proposed.",
      },
    ],
    whyNotTaught: "This IS what is taught — it is the dominant school in most universities. The criticism from Austrians and Monetarists is that it gives governments intellectual cover to spend endlessly. Keynesian ideas justify expanding government power, which is why governments fund universities that teach them.",
    keyBooks: [
      { title: "The General Theory of Employment, Interest and Money", author: "John Maynard Keynes", note: "The foundational text — dense and often misinterpreted" },
    ],
  },
  {
    name: "Supply-Side Economics",
    taught: "partially",
    color: "from-violet-500 to-purple-600",
    founders: "Arthur Laffer, Robert Mundell, Jude Wanniski",
    era: "1970s — present",
    coreIdeas: [
      {
        title: "The Laffer Curve",
        standard: "There is a tax rate that maximizes government revenue. At 0% tax, revenue is $0. At 100% tax, revenue is also $0 (nobody works). Somewhere in between is the optimal rate. If taxes are above that point, LOWERING them actually INCREASES revenue because people work, invest, and produce more.",
        simple: "If a lemonade stand charges $10/cup nobody buys. If it charges $0 it makes nothing. There is a sweet spot where you sell the most and make the most money. Taxes work the same way.",
      },
      {
        title: "Production Drives the Economy",
        standard: "Keynesians focus on demand (spending). Supply-siders focus on production. You cannot consume what has not been produced. Policies should incentivize creation of goods and services (low taxes, less regulation) rather than stimulating consumption.",
        simple: "You cannot eat a pizza that nobody made. The economy starts with making things, not buying things. Make it easy for people to produce, and consumption follows naturally.",
      },
    ],
    whyNotTaught: "Politically polarizing. Associated with Reagan/Thatcher, so dismissed by left-leaning academia. The valid economic insight (incentives affect production) gets lost in political tribalism.",
    keyBooks: [
      { title: "The Way the World Works", author: "Jude Wanniski", note: "The intellectual case for supply-side thinking" },
    ],
  },
]

// ────────────────────────────────────────────
// Key economists they do not teach you about
// ────────────────────────────────────────────
const ECONOMISTS = [
  {
    name: "Friedrich Hayek",
    lived: "1899-1992",
    nobelPrize: "1974",
    keyIdea: "Central planning fails because no single mind can process the information that millions of free individuals process through price signals every second. Freedom is not just a value — it is an information system.",
    simple: "Nobody is smart enough to run an economy. Prices are how millions of people communicate what they need, what they have, and what things are worth. When government controls prices, that communication breaks down.",
    famous: "\"The curious task of economics is to demonstrate to men how little they really know about what they imagine they can design.\"",
    whyMatters: "Predicted the failures of socialism decades before the Soviet Union collapsed. His work on distributed knowledge explains why free markets outperform central planning.",
  },
  {
    name: "Ludwig von Mises",
    lived: "1881-1973",
    nobelPrize: null,
    keyIdea: "Proved mathematically that socialist economic calculation is impossible without free-market prices. Predicted the fall of every centrally planned economy 70 years before it happened.",
    simple: "If you take away prices, nobody knows what anything is worth. Without knowing what things are worth, you cannot decide what to make, how much to make, or who should get it. Every country that tried this ended up with shortages, lines, and poverty.",
    famous: "\"Government is the only institution that can take a valuable commodity like paper, and make it worthless by applying ink.\"",
    whyMatters: "His calculation argument has never been refuted. Every socialist economy has proven him right.",
  },
  {
    name: "Milton Friedman",
    lived: "1912-2006",
    nobelPrize: "1976",
    keyIdea: "Proved the Federal Reserve caused the Great Depression by contracting the money supply at the worst possible time. Inflation is always and everywhere a monetary phenomenon — caused by governments, not businesses.",
    simple: "The Great Depression was not capitalism failing — it was the central bank failing. They took money OUT of the economy when people needed it most. And inflation is not caused by greedy companies raising prices — it is caused by the government printing too much money.",
    famous: "\"There is no such thing as a free lunch.\" \"If you put the federal government in charge of the Sahara Desert, in 5 years there would be a shortage of sand.\"",
    whyMatters: "His work changed monetary policy worldwide. Free to Choose (book and TV series) made economics accessible to millions.",
  },
  {
    name: "Henry Hazlitt",
    lived: "1894-1993",
    nobelPrize: null,
    keyIdea: "The art of economics is looking not merely at the immediate effects of a policy, but at the longer effects — not merely at the consequences for one group, but for all groups. Most bad economic policy comes from ignoring this.",
    simple: "Every government policy has effects you can see AND effects you cannot see. A new factory creates visible jobs. But the taxes that paid for it destroyed invisible jobs that would have existed if people kept their money. Always ask: what is the unseen cost?",
    famous: "\"The art of economics consists in looking not merely at the immediate but at the longer effects of any act or policy.\"",
    whyMatters: "Economics in One Lesson is the single best introduction to economic thinking ever written. 200 pages that change how you see every policy debate.",
  },
  {
    name: "Thomas Sowell",
    lived: "1930-present",
    nobelPrize: null,
    keyIdea: "Economic policies should be judged by their results, not their intentions. Many policies designed to help the poor (rent control, minimum wage, licensing requirements) actually hurt them by reducing supply, eliminating entry-level jobs, and creating barriers to entry.",
    simple: "Just because a law is meant to help does not mean it actually helps. Rent control is meant to make housing affordable, but it reduces the number of apartments built, making housing LESS affordable. Intentions do not matter — results do.",
    famous: "\"It is hard to imagine a more stupid or more dangerous way of making decisions than by putting those decisions in the hands of people who pay no price for being wrong.\"",
    whyMatters: "Former Marxist who changed his mind based on evidence. His work on race, economics, and education challenges virtually every mainstream assumption with data.",
  },
  {
    name: "Murray Rothbard",
    lived: "1926-1995",
    nobelPrize: null,
    keyIdea: "Extended Austrian economics to its logical conclusion: if markets outperform government in producing shoes, food, and cars, why would government outperform markets in producing law, defense, or money? Argued for purely voluntary institutions.",
    simple: "If the government ran a shoe company, shoes would be expensive and terrible. So why do we assume government is good at other things? Rothbard asked: what if EVERYTHING worked better when people could choose freely?",
    famous: "\"The State is a gang of thieves writ large.\"",
    whyMatters: "Whether you agree with his conclusions or not, his analytical framework forces you to question assumptions about what government should and should not do.",
  },
  {
    name: "Frédéric Bastiat",
    lived: "1801-1850",
    nobelPrize: null,
    keyIdea: "The Broken Window Fallacy: if someone breaks a window, the glazier gets paid to fix it — but that money would have been spent on something ELSE that now does not exist. Destruction does not create prosperity. The seen vs. the unseen.",
    simple: "If someone breaks your window, a window repair person gets work. But you would have spent that money on new shoes. The shoe maker lost a sale. The window repair is SEEN. The lost shoe sale is UNSEEN. Most bad economic thinking comes from only looking at what you can see.",
    famous: "\"Government is the great fiction through which everybody endeavors to live at the expense of everybody else.\"",
    whyMatters: "Writing from 1850 that reads like it was written yesterday. His broken window fallacy demolishes the argument that wars, disasters, and destruction are 'good for the economy.'",
  },
]

// ────────────────────────────────────────────
// Concepts they should teach but don't
// ────────────────────────────────────────────
const CONCEPTS = [
  {
    concept: "Cantillon Effect",
    standard: "When new money is created, it does not reach everyone equally. The first recipients (banks, government contractors, financial institutions) benefit from the new money before prices rise. By the time it reaches ordinary people, prices have already increased. Money printing is a wealth transfer from the last receivers (you) to the first receivers (Wall Street).",
    simple: "When the government prints $1 trillion, the banks and big companies get it first. They buy stocks and houses. Prices go up. By the time the money reaches your paycheck, everything already costs more. You get the inflation, they get the assets.",
    whyMatters: "Explains why the rich get richer during money printing and the poor get poorer, even though the stated goal is to 'help the economy.'",
  },
  {
    concept: "Moral Hazard",
    standard: "When someone is protected from the consequences of their actions, they take bigger risks. Banks that know they will be bailed out take reckless risks. People with insurance drive less carefully. The 2008 financial crisis was caused largely by moral hazard — banks kept profits when bets worked and were bailed out by taxpayers when bets failed.",
    simple: "If you knew the government would pay for any car crash, would you drive more carefully or less carefully? Banks that get bailed out are like drivers who do not pay for their own crashes — they drive recklessly because the risk is not theirs.",
    whyMatters: "Explains why bailouts create worse crises. Every bailout guarantees a bigger bubble next time.",
  },
  {
    concept: "Regulatory Capture",
    standard: "The agencies created to regulate industries end up being controlled BY those industries. The FDA is heavily funded by pharmaceutical companies. The SEC is staffed by former Wall Street lawyers. The revolving door between regulator and regulated means the 'watchdog' becomes the pet.",
    simple: "Imagine your school hired a hall monitor, but the bullies got to choose who the monitor was. The monitor would protect the bullies, not the students. That is regulatory capture.",
    whyMatters: "Explains why regulations often protect big companies from competition rather than protecting consumers.",
  },
  {
    concept: "Opportunity Cost",
    standard: "The true cost of anything is what you give up to get it. Going to university does not just cost tuition — it costs 4 years of income you could have earned. Government spending does not just cost tax dollars — it costs what those dollars would have produced if left in private hands.",
    simple: "If you spend Saturday studying, the cost is not the books — it is the pickup game you missed, the time with friends, the nap you needed. Every choice has an invisible price tag: what you gave up.",
    whyMatters: "Forces you to think about what was sacrificed, not just what was gained. Most policy debates ignore opportunity cost entirely.",
  },
  {
    concept: "Inflation as a Hidden Tax",
    standard: "When a government prints money, it does not need to raise taxes to spend more. The purchasing power of existing dollars decreases — which has the same effect as a tax on savings, but nobody votes on it, nobody sees the bill, and nobody is held accountable.",
    simple: "If you saved $10,000 and inflation is 8%, you just lost $800 in purchasing power. Nobody sent you a tax bill. Nobody asked your permission. But the government got to spend that value. Inflation is a tax that is never voted on.",
    whyMatters: "Once you understand this, you understand why governments prefer inflation to raising taxes — it is politically invisible.",
  },
  {
    concept: "Time Preference",
    standard: "People naturally prefer goods now over goods later. Interest rates represent this preference — they are the price of time. When central banks manipulate interest rates below the natural level, they distort time preference for the entire economy, encouraging debt and discouraging savings.",
    simple: "Would you rather have $100 today or $100 next year? Today, obviously. The extra amount someone would have to pay you to wait is the interest rate. When the government makes interest rates artificially low, it is telling everyone: do not save, borrow instead. That is how you get a society drowning in debt.",
    whyMatters: "Explains why savings rates have collapsed and debt has exploded since central banks began actively managing interest rates.",
  },
  {
    concept: "The Tragedy of the Commons",
    standard: "When a resource is shared by everyone and owned by no one, it gets destroyed. If everyone can graze their sheep on a shared field, everyone adds more sheep because the benefit is personal but the cost is shared. The field is destroyed. Private ownership solves this — you protect what you own.",
    simple: "If your family shares one bathroom, it might be messy. If everyone on your street shared it, it would be destroyed. People take care of what they own and abuse what they share. That is why public bathrooms are worse than private ones.",
    whyMatters: "Explains environmental destruction, overfishing, and why private property rights are essential for conservation.",
  },
]

export default function EconomicsEducationPage() {
  const [expandedSchool, setExpandedSchool] = useState<number | null>(0)
  const [expandedEconomist, setExpandedEconomist] = useState<number | null>(null)
  const [expandedConcept, setExpandedConcept] = useState<number | null>(null)
  const [simpleMode, setSimpleMode] = useState(false)

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-red-600">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Economics — What They Don&apos;t Teach You</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          The economists and ideas that most schools skip. Both sides presented — you decide what makes sense.
        </p>
      </div>

      {/* Simple mode toggle */}
      <div className="flex items-center gap-3">
        <button onClick={() => setSimpleMode(!simpleMode)}
          className={cn("rounded-full px-4 py-1.5 text-xs font-medium border transition-all",
            simpleMode ? "bg-violet-100 border-violet-300 text-violet-700" : "border-border text-muted-foreground hover:bg-muted/50"
          )}>
          {simpleMode ? "Simple Mode ON" : "Simple Mode OFF"}
        </button>
        <span className="text-[10px] text-muted-foreground">
          {simpleMode ? "Showing explanations anyone can understand" : "Click or tap ? on any term for a simple explanation"}
        </span>
      </div>

      {/* Why this page exists */}
      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">Why This Page Exists</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Most economics courses — even at university — teach primarily one school of thought (Keynesian) and present
            it as settled science. It is not. There are multiple competing schools with different explanations for how
            economies work, why recessions happen, and what governments should do about it. The economists below
            predicted every major economic crisis of the last century, yet most people have never heard their names.
            This page presents ALL major schools. You deserve to hear every argument and decide for yourself.
          </p>
        </CardContent>
      </Card>

      {/* Schools of thought */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Landmark className="h-5 w-5 text-muted-foreground" /> Schools of Economic Thought
        </h2>
        <div className="space-y-3">
          {SCHOOLS.map((school, i) => {
            const isOpen = expandedSchool === i
            return (
              <Card key={i} className="overflow-hidden">
                <div className="cursor-pointer" onClick={() => setExpandedSchool(isOpen ? null : i)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", school.color)}>
                      <Scale className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{school.name}</p>
                        <Badge variant="outline" className={cn("text-[9px]",
                          school.taught === true ? "text-emerald-600 border-emerald-300" :
                          school.taught === "partially" ? "text-amber-600 border-amber-300" :
                          "text-red-500 border-red-300"
                        )}>
                          {school.taught === true ? "Widely taught" : school.taught === "partially" ? "Partially taught" : "Rarely taught"}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{school.founders}</p>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </CardContent>
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-4">
                    <p className="text-[10px] text-muted-foreground">Era: {school.era}</p>

                    {school.coreIdeas.map((idea, j) => (
                      <div key={j} className="rounded-lg border border-border p-3">
                        <p className="text-sm font-semibold mb-1">{idea.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {simpleMode ? idea.simple : (
                            <Simple text={idea.standard} simple={idea.simple} />
                          )}
                        </p>
                      </div>
                    ))}

                    <div className="rounded-lg bg-amber-50/50 p-3">
                      <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-1">
                        {school.taught === true ? "Why this IS the dominant school" : "Why this is rarely taught"}
                      </p>
                      <p className="text-xs text-muted-foreground">{school.whyNotTaught}</p>
                    </div>

                    {school.keyBooks.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Essential Reading</p>
                        <div className="space-y-1">
                          {school.keyBooks.map((book, k) => (
                            <div key={k} className="flex items-start gap-2 text-xs">
                              <BookOpen className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                              <span><strong>{book.title}</strong> — {book.author}. <span className="text-muted-foreground italic">{book.note}</span></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Key economists */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" /> Economists They Should Have Taught You
        </h2>
        <div className="space-y-3">
          {ECONOMISTS.map((econ, i) => {
            const isOpen = expandedEconomist === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpandedEconomist(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                      {econ.name.split(" ").pop()?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{econ.name}</p>
                        {econ.nobelPrize && <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-300">Nobel {econ.nobelPrize}</Badge>}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{econ.lived}</p>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-12">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {simpleMode ? econ.simple : <Simple text={econ.keyIdea} simple={econ.simple} />}
                      </p>
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                        <p className="text-xs italic text-slate-600">{econ.famous}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground"><strong>Why this matters:</strong> {econ.whyMatters}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Concepts */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" /> 7 Concepts That Change How You See Everything
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Once you understand these, you cannot unsee them. Every policy debate, every news story, every economic
          claim becomes clearer.
        </p>
        <div className="space-y-3">
          {CONCEPTS.map((c, i) => {
            const isOpen = expandedConcept === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpandedConcept(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">{i + 1}</div>
                    <p className="text-sm font-semibold flex-1">{c.concept}</p>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-11">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {simpleMode ? c.simple : <Simple text={c.standard} simple={c.simple} />}
                      </p>
                      <div className="rounded-lg bg-amber-50/50 p-2.5">
                        <p className="text-[10px] text-muted-foreground"><strong>Why this matters:</strong> {c.whyMatters}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* The honest take */}
      <Card className="border-2 border-amber-200 bg-amber-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">Both Sides, Always</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This page leans toward the economists who are underrepresented in formal education — Austrian and
            Chicago school thinkers — because Keynesian economics is already thoroughly taught everywhere. The goal is
            balance, not conversion. Every school of thought has insights AND blind spots. Austrian economics
            underestimates the role of institutions. Keynesian economics overestimates government competence.
            Monetarism assumes central banks can be trusted with stable money (history says otherwise).
            Read the primary sources. Think for yourself. The best economist is someone who understands ALL
            the schools and can see which insights apply to which situations.
          </p>
        </CardContent>
      </Card>

      {/* Data sources */}
      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Reading order for beginners:</strong> Start with <em>Economics in One Lesson</em> (Hazlitt) — it is short, clear,
            and will change how you see every policy debate. Then <em>Free to Choose</em> (Friedman) for the case for
            economic liberty. Then <em>The Road to Serfdom</em> (Hayek) for why central planning is dangerous even with
            good intentions. For a Keynesian counterpoint, read <em>The General Theory</em> (Keynes). For data-driven
            analysis, read Thomas Sowell — any of his 40+ books. For connecting economics to civilizational cycles,
            read Ray Dalio&apos;s <em>Principles for Dealing with the Changing World Order</em>. All are available at public libraries.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/education/finance" className="text-sm text-emerald-600 hover:underline">Financial Literacy</a>
        <a href="/civilizations" className="text-sm text-amber-600 hover:underline">Rise & Fall of Civilizations</a>
        <a href="/economics" className="text-sm text-blue-600 hover:underline">Economic Data</a>
        <a href="/family-economics" className="text-sm text-rose-600 hover:underline">Family Economics</a>
      </div>
    </div>
  )
}
