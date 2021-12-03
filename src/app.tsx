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
    <img className="icon" src={craftXIconSrc} alt="CraftX logo" />
    <button className={`btn ${isDarkMode ? "dark" : ""}`} onClick={copyAndFilterTheCurrentPage}>
      Copy and filter
    </button>
    <button className={`btn ${isDarkMode ? "dark" : ""}`} onClick={paste}>
      Paste 
    </button>    
    <button
        type="button"
        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Button text
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
