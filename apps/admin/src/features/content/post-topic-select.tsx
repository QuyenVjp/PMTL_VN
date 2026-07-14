import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PostTopic } from "@/features/content/queries";

const NO_TOPIC_VALUE = "__none__";

export function topicDisplayName(topic: Pick<PostTopic, "level" | "name">) {
  return `${"— ".repeat(Math.max(0, topic.level))}${topic.name}`;
}

export function PostTopicSelect({
  topics,
  value,
  onChange,
  disabled,
}: {
  topics: PostTopic[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <Select
      value={value || NO_TOPIC_VALUE}
      onValueChange={(next) => onChange(next === NO_TOPIC_VALUE ? "" : next)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Chọn chủ đề" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NO_TOPIC_VALUE}>Chưa chọn chủ đề</SelectItem>
        {topics.map((topic) => (
          <SelectItem key={topic.id} value={topic.id}>
            {topicDisplayName(topic)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
