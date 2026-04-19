import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * Journal Prompts API — curated writing prompts for self-reflection
 * Organized by category, rotates daily for variety
 * No AI needed — these are hand-curated therapeutic prompts
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const prompts = [
    // Gratitude
    { category: "Gratitude", prompt: "Write about 3 things that went well today, no matter how small.", color: "emerald" },
    { category: "Gratitude", prompt: "Who is someone you're grateful for but haven't told? Write what you'd say to them.", color: "emerald" },
    { category: "Gratitude", prompt: "Describe a challenge you faced this week that taught you something valuable.", color: "emerald" },

    // Self-awareness
    { category: "Self-Awareness", prompt: "What emotion have you been avoiding? What would happen if you let yourself feel it?", color: "violet" },
    { category: "Self-Awareness", prompt: "Write about a belief you held 5 years ago that you've since changed. What changed your mind?", color: "violet" },
    { category: "Self-Awareness", prompt: "What are you tolerating in your life that you shouldn't be? What would change if you stopped?", color: "violet" },
    { category: "Self-Awareness", prompt: "If your future self could write you a letter, what would it say?", color: "violet" },

    // Stress & anxiety
    { category: "Stress Relief", prompt: "List everything that's worrying you right now. For each one, write whether you can control it or not.", color: "amber" },
    { category: "Stress Relief", prompt: "What would you do today if you weren't afraid?", color: "amber" },
    { category: "Stress Relief", prompt: "Describe your ideal peaceful morning. What elements can you add to tomorrow?", color: "amber" },
    { category: "Stress Relief", prompt: "Write a letter to your anxiety. What would you say?", color: "amber" },

    // Growth
    { category: "Growth", prompt: "What's one thing you want to learn in the next month? What's the first step?", color: "blue" },
    { category: "Growth", prompt: "Describe a time you failed and what it taught you.", color: "blue" },
    { category: "Growth", prompt: "What would you attempt if you knew you couldn't fail?", color: "blue" },
    { category: "Growth", prompt: "What's a habit you want to build? What's the smallest possible version of it?", color: "blue" },

    // Relationships
    { category: "Relationships", prompt: "Think of the most important person in your life. What have you not told them?", color: "pink" },
    { category: "Relationships", prompt: "Is there a relationship in your life that needs attention? What's one thing you could do this week?", color: "pink" },
    { category: "Relationships", prompt: "Write about a time someone's kindness changed your day.", color: "pink" },

    // Values
    { category: "Values", prompt: "If you could only teach one thing to the next generation, what would it be?", color: "teal" },
    { category: "Values", prompt: "What does 'flourishing' mean to you personally? Not the dictionary definition — yours.", color: "teal" },
    { category: "Values", prompt: "What are you doing when you feel most alive? How can you do more of it?", color: "teal" },
    { category: "Values", prompt: "What would you do differently if nobody was watching or judging?", color: "teal" },

    // Processing
    { category: "Processing", prompt: "What happened today that you need to process? Write it out without filtering.", color: "rose" },
    { category: "Processing", prompt: "Is there anger you're holding onto? Write it down. You don't have to share it.", color: "rose" },
    { category: "Processing", prompt: "What do you need right now that you're not getting? Who could you ask?", color: "rose" },
  ]

  // Select today's prompt (rotates daily based on date)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const todayPrompt = prompts[dayOfYear % prompts.length]

  // Shuffle and return a diverse set
  const shuffled = [...prompts].sort(() => Math.random() - 0.5)
  const categories = [...new Set(prompts.map(p => p.category))]

  return NextResponse.json({
    todayPrompt,
    allPrompts: prompts,
    suggested: shuffled.slice(0, 5),
    categories,
    total: prompts.length,
  })
}
