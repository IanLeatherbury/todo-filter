import { CraftBlock, CraftTextBlock } from "@craftdocs/craft-extension-api";
import * as React from "react"
import * as ReactDOM from 'react-dom'
import craftXIconSrc from "./craftx-icon.png"

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
    <button className={`btn ${isDarkMode ? "dark" : ""}`} onClick={copyTheCurrentPage}>
      Copy page
    </button>
    <button className={`btn ${isDarkMode ? "dark" : ""}`} onClick={paste}>
      Paste page
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

function insertHelloWorld() {
  const block = craft.blockFactory.textBlock({
    content: "Hello world!!!"
  });

  craft.dataApi.addBlocks([block]);
}

async function copyTheCurrentPage() {
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

async function selectDoneItems() {
  // Query the current page
  const result = await craft.dataApi.getCurrentPage();

  // Check for errors
  if (result.status != "success") {
    throw new Error(result.message)
  }

  // Look for blocks which contain the word
  const blocks = result.data.subblocks.filter(block => {
    // Only todo blocks are relevant
    if (block.listStyle.type !== "todo") {
      return false
    }

    // Merge the text run
    const content = block.content.map(x => x.text).join()

    // Search for the word
    const hasLorem = content.indexOf("lorem") > -1

    return hasLorem
  })

  // Extract the block ids
  const blockIds = blocks.map(x => x.id)

  // Make those blocks selected
  const selectResult = await craft.editorApi.selectBlocks(blockIds)

  // Check for errors
  if (selectResult.status != "success") {
    throw new Error(selectResult.message)
  }

  // Optionally we can check which blocks were selected
  const selectedBlocks = selectResult.data

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
