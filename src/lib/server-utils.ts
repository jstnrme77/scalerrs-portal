export function getTableName(boardType: string) {
    switch (boardType?.toLowerCase()) {
        case "cro":
            return "CRO";
        case "technical":
        case "technicalseo":
            return "WQA";
        case "strategy":
        case "strategyadhoc":
            return "Strategy Tasks";
        default:
            console.warn(`getTableName: Unknown boardType '${boardType}'. No table mapping found.`);
            return "";
    }
} 