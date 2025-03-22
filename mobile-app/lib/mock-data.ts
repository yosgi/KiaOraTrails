// Mock data for the application

// Issue data
export const mockIssueData = [
  {
    id: "issue-1",
    type: "scenic",
    title: "Amazing Mountain View",
    description: "Incredible panoramic view of the valley from this spot. Perfect for photos!",
    location: "Mountain Ridge Trail",
    coordinates: { lat: 37.7749, lng: -122.4194 },
    author: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40&text=AJ",
    },
    date: "2 days ago",
    upvotes: 24,
    downvotes: 2,
    image: "/placeholder.svg?height=400&width=600&text=Scenic+View",
    comments: [
      {
        id: "comment-1",
        author: {
          name: "Sarah Miller",
          avatar: "/placeholder.svg?height=40&width=40&text=SM",
        },
        content: "I visited this spot last weekend and it was breathtaking! Definitely worth the hike.",
        date: "1 day ago",
        likes: 5,
        dislikes: 0,
      },
      {
        id: "comment-2",
        author: {
          name: "Mike Davis",
          avatar: "/placeholder.svg?height=40&width=40&text=MD",
        },
        content: "Is this accessible for beginners? Planning to take my family there.",
        date: "12 hours ago",
        likes: 2,
        dislikes: 0,
      },
    ],
  },
  {
    id: "issue-2",
    type: "condition",
    title: "Fallen Tree Blocking Path",
    description: "Large tree has fallen across the main trail about 2 miles in from the trailhead. Difficult to pass.",
    location: "Cedar Creek Trail",
    coordinates: { lat: 37.785, lng: -122.41 },
    author: {
      name: "Chris Wong",
      avatar: "/placeholder.svg?height=40&width=40&text=CW",
    },
    date: "3 days ago",
    upvotes: 42,
    downvotes: 1,
    image: "/placeholder.svg?height=400&width=600&text=Fallen+Tree",
    comments: [
      {
        id: "comment-3",
        author: {
          name: "Taylor Reed",
          avatar: "/placeholder.svg?height=40&width=40&text=TR",
        },
        content: "I was there yesterday and it's still blocked. Had to turn around and go back.",
        date: "2 days ago",
        likes: 8,
        dislikes: 0,
      },
      {
        id: "comment-4",
        author: {
          name: "Jordan Smith",
          avatar: "/placeholder.svg?height=40&width=40&text=JS",
        },
        content: "I've reported this to the park rangers as well. They said they'll try to clear it this week.",
        date: "1 day ago",
        likes: 15,
        dislikes: 0,
      },
    ],
  },
  {
    id: "issue-3",
    type: "fundraising",
    title: "Bridge Repair at River Crossing",
    description:
      "The wooden bridge at the main river crossing is deteriorating and needs repairs before the rainy season.",
    location: "Riverside Trail",
    coordinates: { lat: 37.77, lng: -122.43 },
    author: {
      name: "Jamie Lee",
      avatar: "/placeholder.svg?height=40&width=40&text=JL",
    },
    date: "1 week ago",
    upvotes: 78,
    downvotes: 3,
    image: "/placeholder.svg?height=400&width=600&text=Damaged+Bridge",
    comments: [
      {
        id: "comment-5",
        author: {
          name: "Pat Johnson",
          avatar: "/placeholder.svg?height=40&width=40&text=PJ",
        },
        content: "This is definitely needed. The bridge was very wobbly when I crossed it last month.",
        date: "5 days ago",
        likes: 12,
        dislikes: 0,
      },
      {
        id: "comment-6",
        author: {
          name: "Robin Chen",
          avatar: "/placeholder.svg?height=40&width=40&text=RC",
        },
        content:
          "I'm a carpenter and would be willing to volunteer some time to help with repairs if we get the materials.",
        date: "3 days ago",
        likes: 25,
        dislikes: 0,
      },
    ],
    fundraising: {
      goal: 0.5,
      raised: 0.32,
      contributors: 18,
    },
  },
  {
    id: "issue-4",
    type: "condition",
    title: "Muddy Section After Rain",
    description:
      "The trail becomes extremely muddy and slippery after rainfall. Could use some gravel or stepping stones.",
    location: "Valley Loop Trail",
    coordinates: { lat: 37.765, lng: -122.425 },
    author: {
      name: "Sam Taylor",
      avatar: "/placeholder.svg?height=40&width=40&text=ST",
    },
    date: "4 days ago",
    upvotes: 15,
    downvotes: 2,
    image: "/placeholder.svg?height=400&width=600&text=Muddy+Trail",
    comments: [],
  },
  {
    id: "issue-5",
    type: "scenic",
    title: "Hidden Waterfall",
    description:
      "Beautiful waterfall just off the main trail. Take the small path near the large boulder at mile marker 3.",
    location: "Forest Creek Trail",
    coordinates: { lat: 37.78, lng: -122.415 },
    author: {
      name: "Alex Morgan",
      avatar: "/placeholder.svg?height=40&width=40&text=AM",
    },
    date: "1 week ago",
    upvotes: 35,
    downvotes: 0,
    image: "/placeholder.svg?height=400&width=600&text=Waterfall",
    comments: [],
  },
]

// Treasury data
export const mockTreasuryData = {
  balance: 2.5,
  available: 1.8,
  allocated: 0.7,
  contributors: 45,
  activeProposals: 3,
}

// Proposal data
export const mockProposalData = [
  {
    id: "proposal-1",
    title: "Fix muddy section on Valley Loop Trail",
    amount: 0.25,
    deadline: "3 days left",
    votes: 65,
  },
  {
    id: "proposal-2",
    title: "Install new trail markers at junction points",
    amount: 0.15,
    deadline: "5 days left",
    votes: 42,
  },
  {
    id: "proposal-3",
    title: "Clear fallen trees from Cedar Creek Trail",
    amount: 0.3,
    deadline: "2 days left",
    votes: 78,
  },
]

// User data
export const mockUserData = {
  name: "Jamie Smith",
  avatar: "https://i.pravatar.cc/80",
  location: "San Francisco, CA",
  memberSince: "Jan 2023",
  trailsReported: 12,
  proposalsVoted: 8,
  level: 3,
  reputation: 780,
  tokenBalance: 125,
  badges: [
    {
      name: "Trail Guardian",
      image: "/placeholder.svg?height=40&width=40&text=🏆",
    },
    {
      name: "First Report",
      image: "/placeholder.svg?height=40&width=40&text=🔍",
    },
    {
      name: "Fundraiser",
      image: "/placeholder.svg?height=40&width=40&text=💰",
    },
    {
      name: "Voter",
      image: "/placeholder.svg?height=40&width=40&text=🗳️",
    },
    {
      name: "Explorer",
      image: "/placeholder.svg?height=40&width=40&text=🧭",
    },
  ],
}

// User activity
export const mockUserActivity = [
  {
    title: "Reported trail condition",
    description: "Fallen Tree Blocking Path on Cedar Creek Trail",
    location: "Cedar Creek Trail",
    date: "3 days ago",
    reward: 5,
  },
  {
    title: "Voted on proposal",
    description: "Approved fund allocation for bridge repair",
    date: "1 week ago",
    reward: 2,
  },
  {
    title: "Added comment",
    description: "Commented on 'Hidden Waterfall' report",
    location: "Forest Creek Trail",
    date: "1 week ago",
    reward: 1,
  },
  {
    title: "Created fundraising campaign",
    description: "Started campaign for new trail markers",
    location: "Mountain Ridge Trail",
    date: "2 weeks ago",
    reward: 10,
  },
  {
    title: "Earned badge",
    description: "Received 'Trail Guardian' badge for consistent contributions",
    date: "3 weeks ago",
    reward: 0,
  },
]

