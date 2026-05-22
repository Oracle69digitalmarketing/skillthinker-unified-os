import axios from 'axios';

export const AffiliateService = {
  /**
   * Fetches the best affiliate courses for a given skill gap.
   * This is built with a plug-and-play architecture to easily swap
   * with a real Coursera/Udemy/Impact.com API.
   */
  async getRecommendedCourse(skill: string) {
    try {
      // Logic for real API integration:
      // const response = await axios.get(`https://api.impact.com/courses?query=${skill}&api_key=${process.env.IMPACT_API_KEY}`);
      
      const knowledgeBase: any = {
        "SQL": { 
          name: "SQL for Data Science", 
          platform: "Coursera", 
          url: "https://www.coursera.org/learn/sql-for-data-science",
          price: "$49",
          commission: "$15"
        },
        "Sales": { 
          name: "The Ultimate Sales Bootcamp", 
          platform: "Udemy", 
          url: "https://www.udemy.com/course/sales-training/",
          price: "$19.99",
          commission: "$5"
        },
        "Negotiation": { 
          name: "Successful Negotiation: Essential Strategies", 
          platform: "Coursera", 
          url: "https://www.coursera.org/learn/negotiation",
          price: "Free to Audit / $49 Cert",
          commission: "$15"
        },
        "Leadership": { 
          name: "Leadership in 21st Century", 
          platform: "LinkedIn Learning", 
          url: "https://www.linkedin.com/learning/leadership-foundations",
          price: "Subscription",
          commission: "$10"
        }
      };

      // Match logic
      const skillKey = Object.keys(knowledgeBase).find(k => skill.toLowerCase().includes(k.toLowerCase())) || "SQL";
      const course = knowledgeBase[skillKey];

      return {
        ...course,
        affiliateUrl: `${course.url}?ref=skillthinker_affiliate_id`
      };
    } catch (error) {
      console.error("Affiliate Sync Error:", error);
      return null;
    }
  }
};
