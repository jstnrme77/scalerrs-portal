export function getTableName(boardType: string) {
    switch (boardType) {
        case "cro":        return "CRO Tasks";
        case "technical":  return "Technical CRO Tasks";
        case "strategy":   return "Strategy Ad Hoc Tasks";
        default:           return "CRO Tasks";
    }
} 