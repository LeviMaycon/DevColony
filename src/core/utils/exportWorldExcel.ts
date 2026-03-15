import * as XLSX from "xlsx"

export function exportWorldExcel(foods: any[]) {

    const repos = foods.map((f) => ({
        Repository: f.repoName,
        URL: f.repoUrl,
        Stars: f.repoStars,
        Language: f.repoLanguage,
        Owner: f.repoOwner
    }))

    const ws = XLSX.utils.json_to_sheet(repos)

    repos.forEach((repo, i) => {
        const cellAddress = `B${i + 2}`
        if (!ws[cellAddress]) return

        ws[cellAddress].l = {
            Target: repo.URL
        }
    })

    const wb = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(wb, ws, "Repositories")

    const buffer = XLSX.write(wb, {
        type: "array",
        bookType: "xlsx"
    })

    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    })

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "devcolony-world.xlsx"
    a.click()

    URL.revokeObjectURL(url)
}