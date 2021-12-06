import { CraftBlock, CraftTextBlock } from "@craftdocs/craft-extension-api";
import * as React from "react"
import * as ReactDOM from 'react-dom'
import './style.css'
import 'tailwindcss/tailwind.css'
import { CheckCircleIcon } from '@heroicons/react/solid'
import { useState } from "react";

const App: React.FC<{}> = () => {
  const isDarkMode = useCraftDarkMode();

  const [incompleteOnly, setIncompleteOnly] = useState(false);

  async function cutAndFilterTheCurrentPage() {
    // Query the page which is currently opened
    const result = await craft.dataApi.getCurrentPage()

    // Check if the query succeeded
    if (result.status !== "success") {
      throw new Error(result.message)
    }

    const pageBlock = result.data
    // Save the data into a global variable

    var uncheckedBlocks: CraftBlock[] = []
    var uncheckedBlockIds: string[] = []
    var uncheckedOnly: CraftBlock[] = []
    var uncheckedOnlyIds: string[] = []

    pageBlock.subblocks.filter(async block => {
      if (incompleteOnly === true) {
        if (block.listStyle.type === "todo" && block.listStyle.state === "unchecked") {
          uncheckedOnly.push(block)
          uncheckedOnlyIds.push(block.id)
        } else {
          return
        }
        loadedBlocks = uncheckedOnly
        await craft.dataApi.deleteBlocks(uncheckedOnlyIds)
      } else {
        if (block.listStyle.type === "todo" && block.listStyle.state === "unchecked") {
          uncheckedBlockIds.push(block.id)
          uncheckedBlocks.push(block)
        } else if (block.listStyle.type === "todo" && block.listStyle.state === "checked") {
          return
        }
        else {
          uncheckedBlocks.push(block)
        }
        await craft.dataApi.deleteBlocks(uncheckedBlockIds)
        loadedBlocks = uncheckedBlocks
      }
    })
  }


  async function paste() {
    const blocks = loadedBlocks
    const result = await craft.dataApi.addBlocks(blocks)

    // Check if the update succeeded
    if (result.status !== "success") {
      throw new Error(result.message)
    }
  }

  async function handleincompleteChange() {
    setIncompleteOnly(!incompleteOnly)
  }

  React.useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="flex justify-center">
      <div className="flex flex-col">
        <div className="flex justify-center my-2">
          <CheckCircleIcon className="w-10 h-10 text-blue-500" />
        </div>
        <button className={`btn ${isDarkMode ? "dark" : "px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}`} onClick={cutAndFilterTheCurrentPage}>
          Cut and filter
        </button>
        <button className={`btn ${isDarkMode ? "dark" : "mt-2 px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}`} onClick={paste}>
          Paste
        </button>
        {/* Incomplete Settings */}
        <div className="relative flex items-start my-4">
          <div className="flex items-center h-5">
            <input
              id="incomplete"
              name="incomplete"
              type="checkbox"
              checked={incompleteOnly}
              onChange={handleincompleteChange}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="incomplete" className="font-medium text-gray-700">
              Incomplete Only
            </label>
            <p id="incomplete-description" className="text-gray-500">
              Only cut incomplete todos.
            </p>
          </div>
        </div>
      </div>
    </div>);
}

var loadedBlocks: CraftBlock[] = []

function useCraftDarkMode() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    craft.env.setListener(env => setIsDarkMode(env.colorScheme === "dark"));
  }, []);

  return isDarkMode;
}


export function initApp() {
  ReactDOM.render(<App />, document.getElementById('react-root'))
}
