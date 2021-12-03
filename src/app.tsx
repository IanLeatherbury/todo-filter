import { CraftBlock, CraftTextBlock } from "@craftdocs/craft-extension-api";
import * as React from "react"
import * as ReactDOM from 'react-dom'
import craftXIconSrc from "./craftx-icon.png"
import './style.css'
import 'tailwindcss/tailwind.css'


const App: React.FC<{}> = () => {
  const isDarkMode = useCraftDarkMode();

  React.useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  return <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }}>
    <img className="h-12 icon " src={craftXIconSrc} alt="CraftX logo" />
    <button className={`btn ${isDarkMode ? "dark" : "mt-2 items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}`} onClick={copyAndFilterTheCurrentPage}>
      Copy and filter
    </button>
    <button className={`btn ${isDarkMode ? "dark" : "mt-2 items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}`} onClick={paste}>
      Paste 
    </button>        
  </div>;
}

var loadedBlocks: CraftBlock[] = []

function useCraftDarkMode() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    craft.env.setListener(env => setIsDarkMode(env.colorScheme === "dark"));
  }, []);

  return isDarkMode;
}

async function copyAndFilterTheCurrentPage() {
  // Query the page which is currently opened
  const result = await craft.dataApi.getCurrentPage()

  // Check if the query succeeded
  if (result.status !== "success") {
    throw new Error(result.message)
  }

  const pageBlock = result.data
  // Save the data into a global variable

  var blocksToKeep: CraftBlock[] = []

  pageBlock.subblocks.filter(async block => {
    if (block.listStyle.type === "todo" && block.listStyle.state === "checked") {
      return
    } else {
      blocksToKeep.push(block)
    }
  })

  loadedBlocks = blocksToKeep
}

async function paste() {
  const blocks = loadedBlocks
  const result = await craft.dataApi.addBlocks(blocks)

  // Check if the update succeeded
  if (result.status !== "success") {
    throw new Error(result.message)
  }
}

export function initApp() {
  ReactDOM.render(<App />, document.getElementById('react-root'))
}
